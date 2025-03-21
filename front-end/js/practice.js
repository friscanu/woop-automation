/**
 * Simplified practice page functionality for Woop Learning
 * Handles menu navigation and content loading
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Practice.js loaded successfully!");

    // DOM elements
    const practiceCardsContainer = document.getElementById('practice-cards-container');
    const submenuLinks = document.querySelectorAll('.training-submenu-link');
    const levelDescriptions = document.querySelectorAll('.level-description');

    // Function to create manual cards (no API)
    function createManualCards(categoryId) {
        console.log("Creating manual cards for category:", categoryId);
        
        // IMPORTANT: Clear the entire container first to prevent accumulation
        practiceCardsContainer.innerHTML = '';
        
        // Create section title based on category
        let title = "Practice Resources";
        let description = "";
        
        if (categoryId === 'beginner-quiz') {
            title = "Beginner Certification Quizzes";
            description = "Prepare for certifications with practice quizzes, interactive assessments, and exam tips. Test your knowledge and identify areas for improvement.";
        } else if (categoryId === 'beginner-labs') {
            title = "Beginner Hands-On Labs";
            description = "Get hands-on experience with our interactive lab environments. These virtual workspaces allow you to apply your skills in realistic scenarios.";
        } else if (categoryId === 'intermediate-quiz') {
            title = "Intermediate Certification Quizzes";
            description = "Advance your certification preparation with intermediate-level quizzes and assessments. Test your growing knowledge and prepare for professional certifications.";
        } else if (categoryId === 'intermediate-labs') {
            title = "Intermediate Hands-On Labs";
            description = "Challenge yourself with more complex lab environments. Apply intermediate skills to real-world scenarios and build your practical experience.";
        } else if (categoryId === 'expert-quiz') {
            title = "Expert Certification Quizzes";
            description = "Prepare for advanced certifications with expert-level assessment materials. Test your specialist knowledge and readiness for senior positions.";
        } else if (categoryId === 'expert-labs') {
            title = "Expert Hands-On Labs";
            description = "Master complex technologies and architectures in our advanced lab environments. Apply expert skills to enterprise-level scenarios.";
        }
        
        // Create title element
        const titleElement = document.createElement('h2');
        titleElement.className = 'section-title';
        titleElement.textContent = title;
        practiceCardsContainer.appendChild(titleElement);
        
        // Create description paragraph
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'level-info';
        descriptionElement.textContent = description;
        practiceCardsContainer.appendChild(descriptionElement);
        
        // Create card container
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        // Create sample cards
        for (let i = 1; i <= 3; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Determine whether this is a lab or quiz
            const isQuiz = categoryId.includes('quiz');
            const level = categoryId.split('-')[0];
            
            let cardTitle, cardDescription, cardUrl, cardButtonText, cardTag;
            
            if (isQuiz) {
                cardTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} Certification Quiz ${i}`;
                cardDescription = `Test your knowledge with this ${level}-level certification preparation quiz. Includes multiple choice and scenario-based questions.`;
                cardUrl = `course-example.html?id=${encodeURIComponent(cardTitle)}`;
                cardButtonText = "Start Quiz";
                cardTag = `${level.charAt(0).toUpperCase() + level.slice(1)} Certification`;
            } else {
                cardTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} Practice Lab ${i}`;
                cardDescription = `Get hands-on experience in this ${level}-level interactive lab environment. Apply your skills to real-world scenarios.`;
                
                // Direct URL to the appropriate lab page
                if (level === 'beginner') {
                    cardUrl = 'practice-beginner.html';
                } else if (level === 'intermediate') {
                    cardUrl = 'practice-intermediate.html';
                } else {
                    cardUrl = 'practice-expert.html';
                }
                
                cardButtonText = "Launch Lab";
                cardTag = `${level.charAt(0).toUpperCase() + level.slice(1)} Hands-On`;
            }
            
            card.innerHTML = `
                <div class="card-img">
                    <img src="/api/placeholder/400/320" alt="${cardTitle}">
                    <span class="card-tag">${cardTag}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${cardTitle}</h3>
                    <p class="card-text">${cardDescription}</p>
                    <a href="${cardUrl}" class="btn">${cardButtonText}</a>
                </div>
            `;
            
            cardContainer.appendChild(card);
        }
        
        practiceCardsContainer.appendChild(cardContainer);
    }

    // Add click event listeners to category descriptions
    levelDescriptions.forEach(description => {
        description.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-target');
            console.log("Category description clicked:", categoryId);
            
            // Update active submenu link
            submenuLinks.forEach(link => {
                const linkId = link.getAttribute('href').substring(1);
                if (linkId === categoryId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Create cards for this category
            createManualCards(categoryId);
            
            // Scroll to content section
            practiceCardsContainer.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Add click event listeners to submenu links
    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get categoryId from the href attribute
            const categoryId = this.getAttribute('href').substring(1);
            console.log("Submenu link clicked:", categoryId);
            
            // Remove active class from all links
            submenuLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Create cards for this category
            createManualCards(categoryId);
            
            // Scroll to content section
            practiceCardsContainer.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Load initial content if a submenu link is active
    const activeLink = document.querySelector('.training-submenu-link.active');
    if (activeLink) {
        const categoryId = activeLink.getAttribute('href').substring(1);
        createManualCards(categoryId);
    } else if (levelDescriptions.length > 0) {
        // If no active link, load the first category description by default
        const firstCategory = levelDescriptions[0].getAttribute('data-target');
        createManualCards(firstCategory);
    }
});