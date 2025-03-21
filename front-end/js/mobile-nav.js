document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button
    const header = document.querySelector('.header-content');
    const navMenu = document.querySelector('nav ul');
    
    // Add classes for targeting
    navMenu.classList.add('nav-menu');
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.innerHTML = '☰';
    toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Add toggle button to header
    header.prepend(toggleButton);
    
    // Toggle menu on click
    toggleButton.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        // Change icon based on state
        this.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                toggleButton.innerHTML = '☰';
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            toggleButton.innerHTML = '☰';
        }
    });
});