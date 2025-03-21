/**
 * Training page functionality for Woop Learning
 * Handles the training navigation and content loading
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Training.js loaded successfully!");
    
    // Measure and adjust hero height to match training nav section
    const trainingNavSection = document.querySelector('.training-nav-section');
    const heroSection = document.querySelector('.hero');
    
    if (trainingNavSection && heroSection) {
        const navHeight = trainingNavSection.offsetHeight;
        console.log("Training nav height:", navHeight);
        
        // Set minimum height on hero to match navigation
        heroSection.style.minHeight = navHeight + 'px';
    }
    
    // DOM elements
    const trainingCardsContainer = document.getElementById('training-cards-container');
    const trainingSubmenuLinks = document.querySelectorAll('.training-submenu-link');
    const levelDescriptions = document.querySelectorAll('.level-description');
    
    console.log("Training cards container:", trainingCardsContainer);
    console.log("Training submenu links:", trainingSubmenuLinks.length);
    console.log("Level description cards:", levelDescriptions.length);
    
    // Training course data
    const trainingData = {
        // Beginner level courses
        'beginner-skillup': [
            {
                title: 'Introduction to Programming',
                image: '/api/placeholder/400/320',
                tag: 'Help Desk Technician',
                description: 'Learn the fundamentals of programming with this beginner-friendly course. No prior experience required.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Web Development Basics',
                image: '/api/placeholder/400/320',
                tag: 'Windows Support Specialist',
                description: 'Get started with HTML, CSS, and JavaScript. Build your first website from scratch.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Computer Science Fundamentals',
                image: '/api/placeholder/400/320',
                tag: 'System Administrator',
                description: 'Learn essential computer science concepts including algorithms, data structures, and problem-solving.',
                buttonText: 'Watch Now'
            }
        ],
        'beginner-certification': [
            {
                title: 'CompTIA A+ Certification Prep',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Prepare for the CompTIA A+ certification exam with comprehensive training and practice tests.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Microsoft Office Specialist',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Become certified in Microsoft Office applications and boost your productivity skills.',
                buttonText: 'Enroll Now'
            }
        ],
        'beginner-practice': [
            {
                title: 'Programming Fundamentals Lab',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Apply basic programming concepts with hands-on exercises and guided projects.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Web Development Sandbox',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Practice building simple websites with interactive coding exercises and challenges.',
                buttonText: 'Watch Now'
            }
        ],
        
        // Intermediate level courses
        'intermediate-skillup': [
            {
                title: 'Advanced JavaScript',
                image: '/api/placeholder/400/320',
                tag: 'Popular',
                description: 'Take your JavaScript skills to the next level. Learn ES6+, async programming, and modern frameworks.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'Python for Data Analysis',
                image: '/api/placeholder/400/320',
                tag: 'Hot',
                description: 'Learn to use Python for data manipulation, analysis, and visualization with pandas and matplotlib.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'Full Stack Web Development',
                image: '/api/placeholder/400/320',
                tag: 'Comprehensive',
                description: 'Master both frontend and backend development. Build complete web applications from database to user interface.',
                buttonText: 'Enroll Now'
            }
        ],
        'intermediate-certification': [
            {
                title: 'AWS Certified Developer',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Prepare for the AWS Certified Developer - Associate exam. Learn cloud services and deployment.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'Certified Scrum Master',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Become a certified Scrum Master and lead agile teams effectively.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'CompTIA Security+',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Prepare for the Security+ certification and build fundamental cybersecurity skills.',
                buttonText: 'Enroll Now'
            }
        ],
        'intermediate-practice': [
            {
                title: 'Full Stack Project Workshop',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Build a complete web application with frontend, backend, and database components.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Data Analysis Portfolio Projects',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Work on real-world data analysis projects to build your portfolio and skills.',
                buttonText: 'Watch Now'
            }
        ],
        
        // Expert level courses
        'expert-skillup': [
            {
                title: 'Machine Learning Engineering',
                image: '/api/placeholder/400/320',
                tag: 'Advanced',
                description: 'Learn to design, build and deploy machine learning models at scale for production environments.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'Cloud Architecture',
                image: '/api/placeholder/400/320',
                tag: 'Expert',
                description: 'Design scalable, resilient cloud architectures across multiple platforms. Focus on security and optimization.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'DevOps Engineering',
                image: '/api/placeholder/400/320',
                tag: 'Advanced',
                description: 'Master the tools and practices for modern DevOps. Implement CI/CD pipelines and infrastructure as code.',
                buttonText: 'Enroll Now'
            }
        ],
        'expert-certification': [
            {
                title: 'AWS Solutions Architect Professional',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Prepare for the AWS Solutions Architect - Professional certification with expert-led training.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'Certified Kubernetes Administrator',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Become a certified Kubernetes administrator and master container orchestration.',
                buttonText: 'Enroll Now'
            },
            {
                title: 'CISSP Certification',
                image: '/api/placeholder/400/320',
                tag: 'Certification',
                description: 'Prepare for the CISSP certification and advance your cybersecurity career.',
                buttonText: 'Enroll Now'
            }
        ],
        'expert-practice': [
            {
                title: 'Machine Learning Model Deployment',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Build and deploy machine learning models to production with best practices and monitoring.',
                buttonText: 'Watch Now'
            },
            {
                title: 'Cloud Architecture Case Studies',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Work through complex cloud architecture scenarios based on real-world enterprise requirements.',
                buttonText: 'Watch Now'
            },
            {
                title: 'DevOps Pipeline Implementation',
                image: '/api/placeholder/400/320',
                tag: 'Practice',
                description: 'Implement end-to-end CI/CD pipelines for complex applications and infrastructure.',
                buttonText: 'Watch Now'
            }
        ]
    };
    
    // Function to create course cards
    function createCourseCards(courses) {
        console.log("Creating course cards for:", courses);
        
        // Clear container first
        trainingCardsContainer.innerHTML = '';
        
        if (courses.length === 0) {
            trainingCardsContainer.innerHTML = '<div class="experience-levels-info"><h2 class="section-title">No Courses Available</h2><p class="level-info">There are currently no courses available in this category. Please check back later.</p></div>';
            return;
        }
        
        // Create section title based on active link
        const activeLink = document.querySelector('.training-submenu-link.active');
        let sectionTitle = 'Training Courses';
        
        if (activeLink) {
            const linkId = activeLink.getAttribute('href').substring(1);
            const [level, type] = linkId.split('-');
            
            // Map the type to the display name
            let typeDisplay = type;
            if (type === 'skillup') {
                typeDisplay = 'Role Specific';
            } else if (type === 'certification') {
                typeDisplay = 'Certification Mastery';
            } else if (type === 'practice') {
                typeDisplay = 'Software Specific';
            }
            
            sectionTitle = `${level.charAt(0).toUpperCase() + level.slice(1)} ${typeDisplay} Courses`;
        }
        
        // Create title element
        const titleElement = document.createElement('h2');
        titleElement.className = 'section-title';
        titleElement.textContent = sectionTitle;
        trainingCardsContainer.appendChild(titleElement);
        
        // Create card container
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        // Create cards
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-img">
                    <img src="${course.image}" alt="${course.title}">
                    ${course.tag ? `<span class="card-tag">${course.tag}</span>` : ''}
                </div>
                <div class="card-content">
                    <h3 class="card-title">${course.title}</h3>
                    <p class="card-text">${course.description}</p>
                    <a href="course-example.html?id=${encodeURIComponent(course.title)}" class="btn">${course.buttonText}</a>
                </div>
            `;
            
            cardContainer.appendChild(card);
        });
        
        trainingCardsContainer.appendChild(cardContainer);
    }
    
    // Add click event listeners to training submenu links
    trainingSubmenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Link clicked:", this.getAttribute('href'));
            
            // Remove active class from all links
            trainingSubmenuLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the ID from the href attribute (e.g., #beginner-skillup)
            const id = this.getAttribute('href').substring(1);
            console.log("Loading courses for category:", id);
            
            // Load courses for this category
            if (trainingData[id]) {
                createCourseCards(trainingData[id]);
            } else {
                console.log("No courses found for category:", id);
                createCourseCards([]);
            }
        });
    });
    
    // Add click event listeners to level description cards
    levelDescriptions.forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            console.log("Level card clicked, target:", targetId);
            
            // Find the corresponding submenu link
            const targetLink = Array.from(trainingSubmenuLinks).find(
                link => link.getAttribute('href') === '#' + targetId
            );
            
            if (targetLink) {
                console.log("Found matching submenu link:", targetLink);
                // Trigger a click on the submenu link
                targetLink.click();
                
                // Scroll to the content section
                document.getElementById('training-content').scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                console.log("No matching submenu link found for target:", targetId);
            }
        });
    });
});