const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
const logFile = '/output/logs/shell-recorder.log';

// Track external clients (exclude verifier)
let externalClients = new Set();

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

log(`WebSocket server started on ws://localhost:8080`);
let totalDuration = 3600; // Default to 1 hour

wss.on('connection', (ws) => {
  // Assume the verifier connects from localhost and has a specific identifier if needed
  // For simplicity, we'll mark the first connection as verifier; adjust if needed
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