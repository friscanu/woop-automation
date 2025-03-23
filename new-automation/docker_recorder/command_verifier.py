#!/usr/bin/env python3

import websocket
import subprocess
import os
from datetime import datetime
import time

# Constants
LOG_FILE = "/output/logs/command_verifier.log"
FIFO_PATH = "/tmp/command_fifo"
MAX_RETRY_TIME = 30  # Total seconds to retry WebSocket connection
RETRY_INTERVAL = 1   # Seconds between retries
CHROOT_PATH = "/app/chroot"

def log(message):
    """Append a single-line timestamped message to the verifier log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def verify_command(command):
    """Verify if the command can run in the chroot environment."""
    try:
        # Run command in chroot (mounts are persistent from Dockerfile)
        chroot_cmd = f"chroot {CHROOT_PATH} /bin/bash -c \"{command}\""
        result = subprocess.run(
            chroot_cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode == 0:
            log(f"Verified command '{command}' succeeded in chroot: {result.stdout.strip()}")
            return True, result.stdout
        else:
            log(f"Command '{command}' failed verification in chroot: {result.stderr.strip()}")
            return False, result.stderr
    except Exception as e:
        log(f"Error verifying '{command}' in chroot: {str(e)}")
        return False, str(e)

def send_to_fifo(command):
    """Write a verified command to the FIFO."""
    try:
        with open(FIFO_PATH, "a") as fifo:
            fifo.write(f"{command}\n")
        log(f"Sent '{command}' to FIFO")
    except Exception as e:
        log(f"Failed to write '{command}' to FIFO: {str(e)}")

def on_message(ws, message):
    """Handle incoming WebSocket messages."""
    command = message.strip()
    log(f"Verifier received command: {command}")
    
    # Verify the command in chroot
    is_valid, output = verify_command(command)
    if is_valid:
        send_to_fifo(command)
    else:
        log(f"Verifier blocked '{command}' - invalid: {output}")

def on_error(ws, error):
    """Log WebSocket errors."""
    log(f"Verifier WebSocket error: {str(error)}")

def on_close(ws, close_status_code, close_msg):
    """Log WebSocket closure."""
    log(f"Verifier WebSocket closed: {close_status_code} - {close_msg}")

def on_open(ws):
    """Log WebSocket connection."""
    log("Verifier connected to WebSocket server")

def main():
    """Run the WebSocket client with retry logic."""
    # Overwrite log file on start, matching shell_recorder.log
    with open(LOG_FILE, "w") as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting command verifier\n")
    
    # Log chroot initialization
    if os.path.exists("/app/chroot_setup.log"):
        with open("/app/chroot_setup.log", "r") as f:
            log(f"Chroot setup: {f.read().strip()}")
    else:
        log("Chroot setup not found, verification may fail")
    
    start_time = time.time()
    while time.time() - start_time < MAX_RETRY_TIME:
        try:
            ws = websocket.WebSocketApp(
                "ws://localhost:8080",
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close
            )
            ws.run_forever()
            break
        except Exception as e:
            log(f"Connection attempt failed: {str(e)}. Retrying in {RETRY_INTERVAL} seconds...")
            time.sleep(RETRY_INTERVAL)
    else:
        log(f"Failed to connect to WebSocket server after {MAX_RETRY_TIME} seconds. Giving up.")

if __name__ == "__main__":
    main()