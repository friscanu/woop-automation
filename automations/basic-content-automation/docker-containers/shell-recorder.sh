#!/bin/bash

# Function to focus window using multiple methods
focus_window() {
  local win_id="$1"
  echo "Focusing window $win_id using multiple methods" >> $LOG_FILE
  
  xdotool windowfocus $win_id
  sleep 0.2
  xdotool windowraise $win_id
  sleep 0.2
  xdotool windowactivate --sync $win_id 2>/dev/null || true
  sleep 1
  
  echo "Window focus attempts completed" >> $LOG_FILE
}

# Set up a colorful terminal environment
export PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
export TERM="xterm-256color"

# Create log directory and file
mkdir -p /output/logs
LOG_FILE="/output/logs/xdotool.log"
echo "=== Session started at $(date) ===" > $LOG_FILE

# Create FIFO for command communication
FIFO_PATH="/tmp/command_fifo"
mkfifo $FIFO_PATH 2>/dev/null || true

# Start a virtual display using Xvfb
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset -nocursor &
XVFB_PID=$!
export DISPLAY=:99

# Wait for Xvfb to initialize
sleep 2

# Check dependencies
echo "Checking for xdotool..." >> $LOG_FILE
if ! command -v xdotool >/dev/null 2>&1; then
  echo "xdotool is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "Checking for node and npm..." >> $LOG_FILE
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "node or npm is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "Checking for jq..." >> $LOG_FILE
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is NOT installed" >> $LOG_FILE
  exit 1
fi

# Configure terminal appearance
dbus-daemon --session --address=unix:path=/tmp/dbus-session &
sleep 1

# Set background
(
    sleep 1
    magick convert -size 1920x1080 gradient:blue-green /tmp/background.png
    xsetroot -solid "#2E86C1"
    feh --bg-fill /tmp/background.png 2>/dev/null || xloadimage -onroot -fullscreen /tmp/background.png 2>/dev/null || xv -root -quit /tmp/background.png 2>/dev/null || true
) &

# Configure gnome-terminal profile for better appearance
mkdir -p /root/.config/dconf
dconf write /org/gnome/terminal/legacy/profiles:/:b1dcc9dd-5262-4d8d-a863-c897e6d979b9/use-system-font false 2>/dev/null || true
dconf write /org/gnome/terminal/legacy/profiles:/:b1dcc9dd-5262-4d8d-a863-c897e6d979b9/font "'Monospace 9'" 2>/dev/null || true
gconftool-2 --set /apps/gnome-terminal/profiles/Default/use_theme_colors --type bool false 2>/dev/null || true
gconftool-2 --set /apps/gnome-terminal/profiles/Default/background_color --type string "#1A5276" 2>/dev/null || true
gconftool-2 --set /apps/gnome-terminal/profiles/Default/foreground_color --type string "#FFFFFF" 2>/dev/null || true

# Create bash profile with a welcome message (no dynamic title)
cat > /root/.bashrc << 'EOF'
export PS1="\[\033[01;32m\]\u@docker-alpine\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
export TERM="xterm-256color"
echo -e "\033[1;36m"
echo "               ╔════════════════════════════════════════════╗"
echo "               ║     Welcome to a Woop Learning Guide       ║"
echo "               ╚════════════════════════════════════════════╝"
echo -e "\033[0m"
EOF

# Launch gnome-terminal with custom appearance and better centering
echo "Launching gnome-terminal..." | tee -a $LOG_FILE
gnome-terminal --geometry=78x37+415+100 \
               --title="Initializing..." \
               --zoom=2 \
               -- bash -c 'export TERM=xterm-256color; stty cols 200 rows 120; 
export FONTCONFIG_PATH=/etc/fonts
export LANG=en_US.UTF-8
sleep 5
exec bash' &

# Wait for terminal to start
sleep 2

# Log xdotool debugging info
echo "Starting xdotool debug at $(date)" >> $LOG_FILE

# List all visible windows for debugging
echo "All visible windows:" >> $LOG_FILE
xdotool search --onlyvisible --name ".*" | while read wid; do
  name=$(xdotool getwindowname $wid 2>/dev/null || echo 'unknown')
  echo "Window ID: $wid - Name: $name" >> $LOG_FILE
done

# Find terminal window (temporarily using "Initializing..." as the title)
WINDOW_ID=$(xdotool search --name "Initializing..." 2>/tmp/xdotool_search_error.log || echo '')
if [ -z "$WINDOW_ID" ]; then
  echo "Window not found. Search error:" >> $LOG_FILE
  cat /tmp/xdotool_search_error.log >> $LOG_FILE
  exit 1
fi
echo "Window found with ID: $WINDOW_ID" >> $LOG_FILE

# Extra wait time for window to be ready
sleep 3

# Simulate typing a space to hide the cursor, then backspace to remove it
echo "Simulating dummy typing to hide cursor..." >> $LOG_FILE
focus_window $WINDOW_ID
xdotool type " "
xdotool key BackSpace
echo "Dummy typing complete, cursor should be hidden" >> $LOG_FILE

# Create a Node.js WebSocket server script
cat > /app/websocket_server.js << 'EOF'
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
const fifoPath = '/tmp/command_fifo';
const logFile = '/output/logs/xdotool.log';

function log(message) {
  fs.appendFileSync(logFile, `${message}\n`);
}

log(`WebSocket server started on ws://localhost:8080 at ${new Date().toISOString()}`);
let totalDuration = 60; // Default

wss.on('connection', (ws) => {
  log(`New WebSocket connection established at ${new Date().toISOString()}`);

  ws.on('message', (message) => {
    const msgStr = message.toString();
    log(`Received raw command: ${msgStr}`);
    
    if (msgStr.startsWith('SESSION_DATA=<')) {
      const jsonStr = msgStr.replace('SESSION_DATA=<', '').replace(/>$/, '');
      try {
        const sessionData = JSON.parse(jsonStr);
        log(`Parsed session data: ${JSON.stringify(sessionData)}`);
        if (sessionData.hasOwnProperty('totalDuration')) {
          totalDuration = sessionData.totalDuration;
          log(`Set totalDuration to ${totalDuration} seconds`);
          fs.writeFileSync('/tmp/total_duration', `${totalDuration}`);
        }
      } catch (error) {
        log(`Error parsing session data: ${error.message}`);
      }
    } else {
      const match = msgStr.match(/^CMD[0-9]+=<(.+)>$/);
      if (!match) {
        log(`Error: Failed to parse command from '${msgStr}'`);
        return;
      }
      const command = match[1];
      const baseCmd = command.split(' ')[0];
      const { execSync } = require('child_process');
      try {
        execSync(`command -v ${baseCmd}`, { stdio: 'ignore' });
        log(`Command '${command}' validated: '${baseCmd}' exists.`);
        let attempts = 0;
        const maxAttempts = 5;
        const writeWithRetry = () => {
          log(`Attempting to write '${command}' to FIFO | Attempt ${attempts + 1}`);
          fs.appendFile(fifoPath, `${command}\n`, { flag: 'a' }, (err) => {
            if (err) {
              attempts++;
              if (attempts < maxAttempts) {
                log(`FIFO write failed: ${err.message}. Retrying in 1 second...`);
                setTimeout(writeWithRetry, 1000);
              } else {
                log(`Failed to write '${command}' to FIFO after ${maxAttempts} attempts: ${err.message}`);
              }
            } else {
              log(`Command '${command}' sent to FIFO for processing`);
            }
          });
        };
        writeWithRetry();
      } catch (error) {
        log(`Error: Command '${command}' failed validation: '${baseCmd}' not found.`);
      }
    }
  });
});

wss.on('error', (error) => {
  log(`WebSocket server error: ${error.message}`);
});
EOF

# Start the WebSocket server
echo "Starting WebSocket server..." >> $LOG_FILE
node /app/websocket_server.js &
WEBSOCKET_SERVER_PID=$!
echo "WebSocket server started with PID $WEBSOCKET_SERVER_PID at $(date)" >> $LOG_FILE

# Wait for total_duration to be set
echo "Waiting for total_duration from WebSocket..." >> $LOG_FILE
START_TIME=$(date +%s)
while [ ! -s /tmp/total_duration ]; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$(( CURRENT_TIME - START_TIME ))
  if [ $ELAPSED -ge 10 ]; then
    echo "Timeout reached (10 seconds) waiting for total_duration, defaulting RECORDING_TIME to 60 seconds" >> $LOG_FILE
    RECORDING_TIME=60
    break
  fi
  sleep 0.1
done

# Read RECORDING_TIME from file
RECORDING_TIME=$(cat /tmp/total_duration 2>/dev/null || echo 60)
echo "Set RECORDING_TIME to $RECORDING_TIME seconds at $(date)" >> $LOG_FILE

# Start FFmpeg with dynamic recording time
echo "Starting FFmpeg recording for $RECORDING_TIME seconds at $(date)..." | tee -a $LOG_FILE
ffmpeg -y -f x11grab -video_size 1920x1080 -framerate 30 -i :99 -t $RECORDING_TIME /output/recording.mp4 &
FFMPEG_PID=$!

# Process commands from FIFO with improved reading
process_commands() {
  echo "Process commands started with PID $$ at $(date)" >> $LOG_FILE
  END_TIME=$(( $(date +%s) + RECORDING_TIME ))
  while [ $(date +%s) -lt $END_TIME ]; do
    if IFS= read -r actual_cmd < $FIFO_PATH; then
      if [ -z "$actual_cmd" ]; then
        echo "Received empty command, skipping..." >> $LOG_FILE
        continue
      fi
      echo "Processing command from FIFO: $actual_cmd" >> $LOG_FILE
      focus_window $WINDOW_ID
      type_with_delay "$actual_cmd" $WINDOW_ID
      sleep 1
    else
      echo "Failed to read from FIFO, possibly closed or EOF, continuing..." >> $LOG_FILE
      sleep 1
    fi
  done
  echo "Process commands exiting with PID $$ after reaching recording time limit at $(date)" >> $LOG_FILE
}

# Function to type text with human-like delays
type_with_delay() {
  local text="$1"
  local win_id="$2"
  
  echo "Typing with delay: $text" >> $LOG_FILE
  
  for (( i=0; i<${#text}; i++ )); do
    char="${text:$i:1}"
    xdotool type "$char"
    delay=$(awk -v min=0.15 -v max=0.25 'BEGIN{srand(); print min+rand()*(max-min)}')
    if (( RANDOM % 10 == 0 )); then
      sleep $(awk 'BEGIN{srand(); print 0.5+rand()*0.7}')
    fi
    sleep $delay
  done
  
  sleep 0.8
  xdotool key Return
  echo "Finished typing with delay" >> $LOG_FILE
}

# Start processing commands in a subshell to avoid PID 1 issues
(process_commands) &
PROCESS_COMMANDS_PID=$!

# Wait for recording duration plus buffer, then stop
echo "Main script waiting $(( RECORDING_TIME + 10 )) seconds for recording to complete..." >> $LOG_FILE
sleep $(( RECORDING_TIME + 10 ))

# Stop FFmpeg explicitly
echo "Stopping FFmpeg recording..." >> $LOG_FILE
kill $FFMPEG_PID 2>/dev/null
wait $FFMPEG_PID 2>/dev/null || true
echo "FFmpeg stopped at $(date)" >> $LOG_FILE

# Stop WebSocket server
echo "Stopping WebSocket server..." >> $LOG_FILE
kill $WEBSOCKET_SERVER_PID 2>/dev/null
echo "WebSocket server stopped at $(date)" >> $LOG_FILE

# Cleanup
echo "Stopping Xvfb..." >> $LOG_FILE
kill $XVFB_PID 2>/dev/null
rm -f $FIFO_PATH /tmp/total_duration
echo "Recording complete. Output saved to /output/recording.mp4 at $(date)" >> $LOG_FILE