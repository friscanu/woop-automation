const WebSocket = require('ws');
const fs = require('fs');
const argparse = require('argparse');

const parser = new argparse.ArgumentParser({ description: 'Schedule terminal commands' });
parser.add_argument('--input', { required: true, help: 'Input tutorial JSON' });
parser.add_argument('--timestamps', { default: 'output/audio_timestamps.json', help: 'Audio timestamps JSON' });
const args = parser.parse_args();

const logDir = 'output/logs';
const logFile = `${logDir}/scheduler.log`;

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
}

log('Starting command scheduler...');

const wsUrl = 'ws://localhost:8080';
const tutorial = JSON.parse(fs.readFileSync(args.input, 'utf8'));
const timestamps = JSON.parse(fs.readFileSync(args.timestamps, 'utf8'));
const steps = tutorial.steps;

// CHANGED: Round up and add 5 seconds to totalDuration
const totalDuration = Math.ceil(timestamps.total_duration) + 5;
log(`Total duration from audio (rounded up + 5s): ${totalDuration} seconds`);

const sessionData = { totalDuration, current_datetime: new Date().toISOString() };
const commands = [];

steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.step_command_terminal.forEach((cmd, cmdIndex) => {
        const time = (timestamps.timestamps[cmd] || 0) * 1000;
        commands.push({ step: stepNumber, name: `cmd${cmdIndex + 1}_step${stepNumber}`, action: "type", terminal: cmd, time });
        log(`Scheduled: ${cmd} at ${time}ms`);
    });
});

function connectWebSocket(url, retries = 15, delay = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        function tryConnect() {
            log(`Attempting to connect to WebSocket server (attempt ${attempts + 1}/${retries})...`);
            const ws = new WebSocket(url);
            
            ws.on('open', () => {
                log('Connected to WebSocket server');
                resolve(ws);
            });
            
            ws.on('error', (error) => {
                if (attempts < retries - 1) {
                    attempts++;
                    log(`Connection failed: ${error.message}. Retrying in ${delay}ms...`);
                    setTimeout(tryConnect, delay);
                } else {
                    reject(new Error(`Failed to connect after ${retries} attempts: ${error.message}`));
                }
            });
        }
        tryConnect();
    });
}

connectWebSocket(wsUrl)
    .then(ws => {
        ws.send(`SESSION_DATA=<${JSON.stringify(sessionData)}>`);
        
        log(`Scheduling ${commands.length} commands...`);
        commands.forEach(cmd => {
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(`CMD${cmd.step}=<${cmd.terminal}>`);
                    log(`Sent: ${cmd.terminal} at ${cmd.time}ms`);
                } else {
                    log(`Failed to send: ${cmd.terminal} at ${cmd.time}ms - WebSocket closed`);
                }
            }, cmd.time);
        });

        const lastCommandTime = Math.max(...commands.map(cmd => cmd.time));
        setTimeout(() => {
            log('All commands should have been sent, closing connection');
            ws.close();
        }, lastCommandTime + 2000);

        ws.on('close', () => {
            log('WebSocket connection closed');
        });
    })
    .catch(error => {
        log(error.message);
        process.exit(1);
    });