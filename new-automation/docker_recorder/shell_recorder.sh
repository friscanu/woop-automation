#!/bin/bash

# Function to focus window using multiple methods
focus_window() {
  local win_id="$1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Focusing window $win_id using multiple methods" >> $LOG_FILE
  
  xdotool windowfocus $win_id
  sleep 0.2
  xdotool windowraise $win_id
  sleep 0.2
  xdotool windowactivate --sync $win_id 2>/dev/null || true
  sleep 1
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Window focus attempts completed" >> $LOG_FILE
}

# Set up a colorful terminal environment
export PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
export TERM="xterm-256color"

# Create log directory and file
mkdir -p /output/logs
LOG_FILE="/output/logs/shell_recorder.log"  # Renamed from shell-recorder.log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Session started at $(date) ===" > $LOG_FILE  # Overwrites on start

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
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for xdotool..." >> $LOG_FILE
if ! command -v xdotool >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] xdotool is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for node and npm..." >> $LOG_FILE
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] node or npm is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for jq..." >> $LOG_FILE
if ! command -v jq >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] jq is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for python3..." >> $LOG_FILE
if ! command -v python3 >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] python3 is NOT installed" >> $LOG_FILE
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking for nc..." >> $LOG_FILE
if ! command -v nc >/dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] nc (netcat) is NOT installed" >> $LOG_FILE
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

# Create bash profile with a welcome message
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
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Launching gnome-terminal..." | tee -a $LOG_FILE
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

# Log debugging info
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting debug" >> $LOG_FILE

# List all visible windows for debugging
echo "[$(date '+%Y-%m-%d %H:%M:%S')] All visible windows:" >> $LOG_FILE
xdotool search --onlyvisible --name ".*" | while read wid; do
  name=$(xdotool getwindowname $wid 2>/dev/null || echo 'unknown')
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Window ID: $wid - Name: $name" >> $LOG_FILE
done

# Find terminal window
WINDOW_ID=$(xdotool search --name "Initializing..." 2>/tmp/xdotool_search_error.log || echo '')
if [ -z "$WINDOW_ID" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Window not found. Search error:" >> $LOG_FILE
  cat /tmp/xdotool_search_error.log >> $LOG_FILE
  exit 1
fi
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Window found with ID: $WINDOW_ID" >> $LOG_FILE

# Extra wait time for window to be ready
sleep 3

# Simulate typing a space to hide the cursor, then backspace to remove it
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Simulating dummy typing to hide cursor..." >> $LOG_FILE
focus_window $WINDOW_ID
xdotool type " "
xdotool key BackSpace
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dummy typing complete, cursor should be hidden" >> $LOG_FILE

# Create a Node.js WebSocket server script
cat > /app/websocket_server.js << 'EOF'
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
const logFile = '/output/logs/shell_recorder.log';

let externalClients = new Set();

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

log(`WebSocket server started on ws://localhost:8080`);
let totalDuration = 3600; // Default to 1 hour

wss.on('connection', (ws) => {
  if (externalClients.size === 0 && wss.clients.size === 1) {
    log(`Verifier connected. Not counting as external client`);
  } else {
    externalClients.add(ws);
    log(`New external WebSocket connection established. External clients: ${externalClients.size}`);
  }

  ws.on('message', (message) => {
    const msgStr = message.toString().trim();
    log(`Received raw command: ${msgStr}`);
    
    if (msgStr.startsWith('SESSION_DATA=')) {
      const jsonStr = msgStr.replace('SESSION_DATA=', '');
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
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msgStr);
          log(`Broadcasted '${msgStr}' to client`);
        }
      });
    }
  });

  ws.on('close', () => {
    if (externalClients.has(ws)) {
      externalClients.delete(ws);
      log(`External WebSocket client disconnected. Remaining external clients: ${externalClients.size}`);
      if (externalClients.size === 0) {
        log(`All external clients disconnected, signaling stop`);
        fs.writeFileSync('/tmp/stop_signal', 'stop');
      }
    } else {
      log(`Verifier disconnected`);
    }
  });
});

wss.on('error', (error) => {
  log(`WebSocket server error: ${error.message}`);
});
EOF

# Start the WebSocket server
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting WebSocket server..." >> $LOG_FILE
node /app/websocket_server.js &
WEBSOCKET_SERVER_PID=$!
echo "[$(date '+%Y-%m-%d %H:%M:%S')] WebSocket server started with PID $WEBSOCKET_SERVER_PID" >> $LOG_FILE

# Wait until WebSocket server is listening on port 8080
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for WebSocket server to be ready..." >> $LOG_FILE
timeout 30s bash -c "until nc -z localhost 8080; do sleep 1; done"
if [ $? -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WebSocket server is ready on port 8080" >> $LOG_FILE
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Failed to detect WebSocket server on port 8080 after 30 seconds" >> $LOG_FILE
  exit 1
fi

# Start the command verifier using the virtual environment
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting command verifier..." >> $LOG_FILE
/app/venv/bin/python /app/command_verifier.py &
VERIFIER_PID=$!
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Command verifier started with PID $VERIFIER_PID" >> $LOG_FILE

# Wait for total_duration to be set
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for total_duration from WebSocket..." >> $LOG_FILE
START_TIME=$(date +%s)
while [ ! -s /tmp/total_duration ]; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$(( CURRENT_TIME - START_TIME ))
  if [ $ELAPSED -ge 10 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Timeout reached (10 seconds) waiting for total_duration, defaulting RECORDING_TIME to 3600 seconds" >> $LOG_FILE
    RECORDING_TIME=3600
    break
  fi
  sleep 0.1
done

# Read RECORDING_TIME from file
RECORDING_TIME=$(cat /tmp/total_duration 2>/dev/null || echo 3600)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Set RECORDING_TIME to $RECORDING_TIME seconds" >> $LOG_FILE

# Start FFmpeg with dynamic recording time
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting FFmpeg recording for $RECORDING_TIME seconds..." | tee -a $LOG_FILE
ffmpeg -y -f x11grab -video_size 1920x1080 -framerate 30 -i :99 -t $RECORDING_TIME /output/recording.mp4 &
FFMPEG_PID=$!

# Process commands from FIFO with improved reading
process_commands() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Process commands started with PID $$" >> $LOG_FILE
  while true; do
    if [ -f /tmp/stop_signal ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stop signal received, stopping command processing" >> $LOG_FILE
      break
    fi
    if IFS= read -r actual_cmd < $FIFO_PATH; then
      if [ -z "$actual_cmd" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Received empty command, skipping..." >> $LOG_FILE
        continue
      fi
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing command from FIFO: $actual_cmd" >> $LOG_FILE
      focus_window $WINDOW_ID
      type_with_delay "$actual_cmd" $WINDOW_ID
      sleep 1
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Failed to read from FIFO, possibly closed or EOF, continuing..." >> $LOG_FILE
      sleep 1
    fi
  done
}

# Function to type text with human-like delays
type_with_delay() {
  local text="$1"
  local win_id="$2"
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Typing with delay: $text" >> $LOG_FILE
  
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
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Finished typing with delay" >> $LOG_FILE
}

# Start processing commands in a subshell
(process_commands) &
PROCESS_COMMANDS_PID=$!

# Wait for WebSocket disconnection signal
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for WebSocket client disconnection..." >> $LOG_FILE
while [ ! -f /tmp/stop_signal ]; do
  sleep 1
done

# Stop FFmpeg and wait for video to finalize
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping FFmpeg recording..." >> $LOG_FILE
kill $FFMPEG_PID 2>/dev/null
wait $FFMPEG_PID 2>/dev/null || true
echo "[$(date '+%Y-%m-%d %H:%M:%S')] FFmpeg stopped, video created at /output/recording.mp4" >> $LOG_FILE

# Stop WebSocket server and verifier
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping WebSocket server..." >> $LOG_FILE
kill $WEBSOCKET_SERVER_PID 2>/dev/null
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping command verifier..." >> $LOG_FILE
kill $VERIFIER_PID 2>/dev/null

# Cleanup and exit
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping Xvfb..." >> $LOG_FILE
kill $XVFB_PID 2>/dev/null
rm -f $FIFO_PATH /tmp/total_duration /tmp/stop_signal
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recording complete. Output saved to /output/recording.mp4" >> $LOG_FILE