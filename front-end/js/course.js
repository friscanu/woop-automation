/**
 * Course Page Functionality
 * Handles video playback, navigation, and user interaction
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videoPlayer = document.getElementById('video-player');
    const videoItems = document.querySelectorAll('.video-item');
    const currentVideoTitle = document.getElementById('current-video-title');
    const currentVideoNumber = document.getElementById('current-video-number');
    const currentVideoDuration = document.getElementById('current-video-duration');
    const prevVideoBtn = document.getElementById('prev-video');
    const nextVideoBtn = document.getElementById('next-video');
    const markCompleteBtn = document.getElementById('mark-complete');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const userNotes = document.getElementById('user-notes');
    const saveNotesBtn = document.getElementById('save-notes');
    
    // Track current video
    let currentVideoIndex = 0;
    
    // Get course ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    console.log('Course ID:', courseId);
    
    // Initialize video player with the first video
    function initializeVideoPlayer() {
        // If we have a courseId, we would normally fetch course data from the API
        // For now, we're using the default embedded video
        updateVideoNavButtons();
        loadVideoNotes();
    }
    
    // Handle video selection
    videoItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active class
            videoItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update current video index
            currentVideoIndex = index;
            
            // Get video details
            const videoLink = item.querySelector('a');
            const videoId = videoLink.getAttribute('data-video-id');
            const videoTitle = videoLink.querySelector('.video-title').textContent;
            const videoDuration = videoLink.querySelector('.video-duration').textContent;
            const videoNumber = videoLink.querySelector('.video-number').textContent;
            
            // Update video player
            videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
            
            // Update video info
            currentVideoTitle.textContent = videoTitle;
            currentVideoNumber.textContent = `Video ${videoNumber}`;
            currentVideoDuration.textContent = videoDuration;
            
            // Update navigation buttons
            updateVideoNavButtons();
            
            // Load user notes for this video
            loadVideoNotes();
        });
    });
    
    // Handle previous video button
    prevVideoBtn.addEventListener('click', function() {
        if (currentVideoIndex > 0) {
            // Trigger click on previous video item
            videoItems[currentVideoIndex - 1].querySelector('a').click();
        }
    });
    
    // Handle next video button
    nextVideoBtn.addEventListener('click', function() {
        if (currentVideoIndex < videoItems.length - 1) {
            // Trigger click on next video item
            videoItems[currentVideoIndex + 1].querySelector('a').click();
        }
    });
    
    // Update navigation button states
    function updateVideoNavButtons() {
        prevVideoBtn.disabled = currentVideoIndex === 0;
        nextVideoBtn.disabled = currentVideoIndex === videoItems.length - 1;
    }
    
    // Handle mark as complete button
    markCompleteBtn.addEventListener('click', function() {
        // In a full implementation, this would update progress on the server
        const videoItem = videoItems[currentVideoIndex];
        
        // Toggle button text
        if (this.textContent === 'Mark as Complete') {
            this.textContent = 'Marked as Complete';
            this.style.backgroundColor = '#666';
            
            // Add completed class to video item
            videoItem.classList.add('completed');
        } else {
            this.textContent = 'Mark as Complete';
            this.style.backgroundColor = '';
            
            // Remove completed class from video item
            videoItem.classList.remove('completed');
        }
        
        // Save completion status
        saveVideoProgress();
    });
    
    // Save video progress to localStorage
    function saveVideoProgress() {
        // In a full implementation, this would use the API
        // For now, we'll use localStorage
        
        if (!courseId) return;
        
        const courseProgress = JSON.parse(localStorage.getItem(`course_${courseId}_progress`) || '{}');
        courseProgress[`video_${currentVideoIndex}`] = {
            completed: markCompleteBtn.textContent === 'Marked as Complete',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(courseProgress));
    }
    
    // Handle tab switching
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
    
    // Handle notes saving
    saveNotesBtn.addEventListener('click', function() {
        saveVideoNotes();
    });
    
    // Save notes to localStorage
    function saveVideoNotes() {
        if (!courseId) return;
        
        const courseNotes = JSON.parse(localStorage.getItem(`course_${courseId}_notes`) || '{}');
        courseNotes[`video_${currentVideoIndex}`] = userNotes.value;
        
        localStorage.setItem(`course_${courseId}_notes`, JSON.stringify(courseNotes));
        
        // Show save confirmation
        alert('Notes saved successfully!');
    }
    
    // Load notes from localStorage
    function loadVideoNotes() {
        if (!courseId) return;
        
        const courseNotes = JSON.parse(localStorage.getItem(`course_${courseId}_notes`) || '{}');
        userNotes.value = courseNotes[`video_${currentVideoIndex}`] || '';
    }
    
    // Add responsive sidebar toggle for mobile devices
    function setupMobileView() {
        const body = document.body;
        const sidebar = document.querySelector('.course-sidebar');
        
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
        
        // Close sidebar when a video is selected (on mobile)
        videoItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    body.classList.remove('show-sidebar');
                }
            });
        });
    }
    
    // Initialize the page
    initializeVideoPlayer();
    setupMobileView();
    
    // Handle window resize for responsive design
    window.addEventListener('resize', function() {
        // Any resize-specific logic can go here
    });
});