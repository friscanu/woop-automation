/**
 * Practice Lab functionality for Woop Learning
 * Handles the interactive practice lab environment
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Practice Lab JS loaded successfully!");
    
    // DOM Elements
    const taskItems = document.querySelectorAll('.task-item');
    const taskHeaders = document.querySelectorAll('.task-header');
    const terminal = document.getElementById('terminal');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.querySelector('.terminal-output');
    const resetTerminalBtn = document.getElementById('reset-terminal');
    const fullscreenTerminalBtn = document.getElementById('fullscreen-terminal');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const userNotes = document.getElementById('user-notes');
    const saveNotesBtn = document.getElementById('save-notes');
    
    // Lab metadata
    const labTitle = document.getElementById('lab-title').textContent;
    const labId = window.location.pathname.split('/').pop().replace('.html', '');
    
    console.log("Lab title:", labTitle);
    console.log("Lab ID:", labId);
    
    // Initialize terminal commands history
    let commandHistory = [];
    let historyIndex = -1;
    
    // Terminal command processor
    function processCommand(command) {
        // Add command to history
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        
        // Display command in terminal
        const commandLine = document.createElement('div');
        commandLine.className = 'output-line';
        commandLine.textContent = document.querySelector('.prompt').textContent + ' ' + command;
        terminalOutput.appendChild(commandLine);
        
        // Process command (simplified simulation)
        let response;
        
        // Basic command processing logic
        if (command.startsWith('ls')) {
            response = simulateLsCommand(command);
        } else if (command.startsWith('cd')) {
            response = simulateCdCommand(command);
        } else if (command.startsWith('pwd')) {
            response = '/home/user';
        } else if (command.startsWith('mkdir')) {
            response = simulateMkdirCommand(command);
        } else if (command.startsWith('touch')) {
            response = simulateTouchCommand(command);
        } else if (command.startsWith('cat')) {
            response = simulateCatCommand(command);
        } else if (command.startsWith('echo')) {
            response = simulateEchoCommand(command);
        } else if (command.startsWith('docker')) {
            response = simulateDockerCommand(command);
        } else if (command.startsWith('kubectl')) {
            response = simulateKubernetesCommand(command);
        } else if (command === 'clear') {
            // Clear terminal
            terminalOutput.innerHTML = '';
            return;
        } else if (command === 'help') {
            response = "Available commands: ls, cd, pwd, mkdir, touch, cat, echo, docker, kubectl, clear, help";
        } else if (command.trim() === '') {
            // Empty command, just add a new prompt
            appendPrompt();
            return;
        } else {
            response = `Command not found: ${command}`;
        }
        
        // Display response
        if (response) {
            const responseLines = Array.isArray(response) ? response : response.split('\n');
            responseLines.forEach(line => {
                const responseLine = document.createElement('div');
                responseLine.className = 'output-line';
                responseLine.textContent = line;
                terminalOutput.appendChild(responseLine);
            });
        }
        
        // Add new prompt
        appendPrompt();
        
        // Auto-scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
        
        // Check if task is completed based on command
        checkTaskCompletion(command);
    }
    
    // Simulated command responders
    function simulateLsCommand(command) {
        // Basic ls command simulation
        const options = command.replace('ls', '').trim();
        if (options.includes('-la') || options.includes('-al')) {
            return [
                'total 20',
                'drwxr-xr-x 3 user user 4096 Mar  8 10:30 .',
                'drwxr-xr-x 5 user user 4096 Mar  8 10:25 ..',
                '-rw-r--r-- 1 user user  220 Mar  8 10:20 .bash_logout',
                '-rw-r--r-- 1 user user 3771 Mar  8 10:20 .bashrc',
                '-rw-r--r-- 1 user user  807 Mar  8 10:20 .profile',
                'drwxr-xr-x 2 user user 4096 Mar  8 10:30 test_dir'
            ];
        } else {
            return ['test_dir  file1.txt  file2.txt'];
        }
    }
    
    function simulateCdCommand(command) {
        const dir = command.replace('cd', '').trim();
        document.querySelector('.prompt').textContent = `user@lab:${dir === '..' ? '~' : dir}$`;
        return '';
    }
    
    function simulateMkdirCommand(command) {
        const dirName = command.replace('mkdir', '').trim();
        return '';
    }
    
    function simulateTouchCommand(command) {
        const fileName = command.replace('touch', '').trim();
        return '';
    }
    
    function simulateCatCommand(command) {
        const fileName = command.replace('cat', '').trim();
        if (fileName === 'test.txt') {
            return 'Hello World';
        } else {
            return `cat: ${fileName}: No such file or directory`;
        }
    }
    
    function simulateEchoCommand(command) {
        // Extract the echo content
        const match = command.match(/echo\s+"([^"]+)"/);
        if (match) {
            return match[1];
        } else {
            const content = command.replace('echo', '').trim();
            // Check for redirection
            if (content.includes('>')) {
                return '';
            } else {
                return content;
            }
        }
    }
    
    function simulateDockerCommand(command) {
        if (command === 'docker --version') {
            return 'Docker version 24.0.7, build afdd53b';
        } else if (command === 'docker info') {
            return [
                'Client:',
                ' Context:    default',
                ' Debug Mode: false',
                '',
                'Server:',
                ' Containers: 1',
                ' Running: 0',
                ' Paused: 0',
                ' Stopped: 1',
                ' Images: 2',
                ' Server Version: 24.0.7'
            ];
        } else if (command === 'docker run hello-world') {
            return [
                'Unable to find image \'hello-world:latest\' locally',
                'latest: Pulling from library/hello-world',
                '719385e32844: Pull complete',
                'Digest: sha256:c2e23035d6a4b4ff6ac1e7b979ebd55cb7b7f9be6fc9ba9456a1ba3bc6c3808c',
                'Status: Downloaded newer image for hello-world:latest',
                '',
                'Hello from Docker!',
                'This message shows that your installation appears to be working correctly.'
            ];
        } else if (command.includes('docker pull')) {
            const image = command.split(' ').pop();
            return [
                `Using default tag: latest`,
                `latest: Pulling from library/${image.split(':')[0]}`,
                `a7344f52cb74: Pull complete`,
                `515c9bb51536: Pull complete`,
                `e1eabe0537eb: Pull complete`,
                `Digest: sha256:cf13d45f561a0d93af7281113a5deb78a2ee295c5f8c1dc44c73c5747bc0b9f4`,
                `Status: Downloaded newer image for ${image}`,
                `docker.io/library/${image}`
            ];
        } else if (command === 'docker images') {
            return [
                'REPOSITORY    TAG       IMAGE ID       CREATED         SIZE',
                'nginx         latest    a8758716bb6a   2 weeks ago     187MB',
                'hello-world   latest    d2c94e258dcb   7 months ago    13.3kB'
            ];
        } else {
            return `Simulated response for: ${command}`;
        }
    }
    
    function simulateKubernetesCommand(command) {
        if (command === 'kubectl version --short') {
            return [
                'Client Version: v1.28.4',
                'Kustomize Version: v5.0.4',
                'Server Version: v1.28.4'
            ];
        } else if (command === 'kubectl cluster-info') {
            return [
                'Kubernetes control plane is running at https://kubernetes.docker.internal:6443',
                'CoreDNS is running at https://kubernetes.docker.internal:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy',
                '',
                'To further debug and diagnose cluster problems, use \'kubectl cluster-info dump\'.'
            ];
        } else if (command.includes('kubectl get nodes')) {
            return [
                'NAME          STATUS   ROLES           AGE     VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION      CONTAINER-RUNTIME',
                'k8s-master    Ready    control-plane   5d      v1.28.4   192.168.1.10   <none>        Ubuntu 22.04.3 LTS   5.15.0-92-generic   containerd://1.6.28',
                'k8s-worker1   Ready    <none>          5d      v1.28.4   192.168.1.11   <none>        Ubuntu 22.04.3 LTS   5.15.0-92-generic   containerd://1.6.28',
                'k8s-worker2   Ready    <none>          5d      v1.28.4   192.168.1.12   <none>        Ubuntu 22.04.3 LTS   5.15.0-92-generic   containerd://1.6.28'
            ];
        } else {
            return `Simulated response for: ${command}`;
        }
    }
    
    function appendPrompt() {
        const promptLine = document.createElement('div');
        promptLine.className = 'output-line';
        promptLine.textContent = document.querySelector('.prompt').textContent;
        terminalOutput.appendChild(promptLine);
    }
    
    // Terminal input handlers
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = this.value.trim();
            this.value = '';
            processCommand(command);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Simple tab completion could be implemented here
        }
    });
    
    // Reset terminal button
    resetTerminalBtn.addEventListener('click', function() {
        terminalOutput.innerHTML = '';
        const welcomeLine1 = document.createElement('div');
        welcomeLine1.className = 'output-line';
        welcomeLine1.textContent = `Welcome to the ${labTitle} Lab!`;
        terminalOutput.appendChild(welcomeLine1);
        
        const welcomeLine2 = document.createElement('div');
        welcomeLine2.className = 'output-line';
        welcomeLine2.textContent = 'Type commands below to complete the tasks.';
        terminalOutput.appendChild(welcomeLine2);
        
        appendPrompt();
        
        // Reset command history
        commandHistory = [];
        historyIndex = -1;
    });
    
    // Fullscreen terminal button
    fullscreenTerminalBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            terminal.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    // Task completion checker
    function checkTaskCompletion(command) {
        // This is a simplified example - in a real application, you would have more complex logic
        // to determine if a task is completed based on the commands and their outputs
        
        const activeTask = document.querySelector('.task-item.active');
        if (!activeTask) return;
        
        const taskId = activeTask.getAttribute('data-task-id');
        const taskStatusEl = activeTask.querySelector('.task-status');
        
        // Simple checks - in reality these would be more sophisticated
        if (taskId === '1' && (command.includes('ls') || command.includes('pwd'))) {
            taskStatusEl.classList.add('completed');
            saveTaskProgress(taskId, true);
        }
        else if (taskId === '2' && command.includes('touch') && command.includes('.txt')) {
            taskStatusEl.classList.add('completed');
            saveTaskProgress(taskId, true);
        }
        else if (taskId === '3' && command.includes('mkdir')) {
            taskStatusEl.classList.add('completed');
            saveTaskProgress(taskId, true);
        }
        else if (taskId === '4' && command.includes('chmod')) {
            taskStatusEl.classList.add('completed');
            saveTaskProgress(taskId, true);
        }
        else if (taskId === '5' && (command.includes('find') || command.includes('grep'))) {
            taskStatusEl.classList.add('completed');
            saveTaskProgress(taskId, true);
        }
    }
    
    // Task selection
    taskHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const taskItem = this.parentElement;
            
            // Toggle active state
            if (taskItem.classList.contains('active')) {
                taskItem.classList.remove('active');
            } else {
                // Close any open task
                document.querySelectorAll('.task-item.active').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Open this task
                taskItem.classList.add('active');
            }
        });
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab content
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Notes handling
    saveNotesBtn.addEventListener('click', function() {
        saveNotes();
    });
    
    function saveNotes() {
        // Save notes to localStorage
        localStorage.setItem(`${labId}_notes`, userNotes.value);
        alert('Notes saved successfully!');
    }
    
    function loadNotes() {
        // Load notes from localStorage
        const notes = localStorage.getItem(`${labId}_notes`);
        if (notes) {
            userNotes.value = notes;
        }
    }
    
    // Task progress persistence
    function saveTaskProgress(taskId, completed) {
        // Get existing progress or initialize empty object
        const progress = JSON.parse(localStorage.getItem(`${labId}_progress`) || '{}');
        
        // Update progress for this task
        progress[taskId] = {
            completed,
            timestamp: new Date().toISOString()
        };
        
        // Save updated progress
        localStorage.setItem(`${labId}_progress`, JSON.stringify(progress));
    }
    
    function loadTaskProgress() {
        // Load task progress from localStorage
        const progress = JSON.parse(localStorage.getItem(`${labId}_progress`) || '{}');
        
        // Apply progress to task items
        Object.entries(progress).forEach(([taskId, data]) => {
            if (data.completed) {
                const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
                if (taskItem) {
                    const statusEl = taskItem.querySelector('.task-status');
                    statusEl.classList.add('completed');
                }
            }
        });
    }
    
    // Add responsive sidebar toggle for mobile devices
    function setupMobileView() {
        const body = document.body;
        const sidebar = document.querySelector('.lab-sidebar');
        
        // Create toggle button if it doesn't exist
        if (!document.querySelector('.sidebar-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle';
            toggleBtn.innerHTML = '☰';
            toggleBtn.addEventListener('click', function() {
                body.classList.toggle('show-sidebar');
            });
            
            body.appendChild(toggleBtn);
        }
        
        // Close sidebar when a task is selected (on mobile)
        taskHeaders.forEach(header => {
            header.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    body.classList.remove('show-sidebar');
                }
            });
        });
    }
    
    // Initialize the lab environment
    function initLab() {
        loadNotes();
        loadTaskProgress();
        setupMobileView();
        
        // Focus on terminal input
        terminalInput.focus();
    }
    
    // Start initialization
    initLab();
});