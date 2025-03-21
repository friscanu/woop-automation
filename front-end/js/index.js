/**
 * News section functionality for Woop Learning
 * Fetches and displays latest news from the API
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch news from the API
    async function fetchNews() {
        const newsContainer = document.getElementById('news-cards');
        const loadingElement = document.querySelector('.loading');
        
        try {
            // Make API request to the news endpoint
            const response = await fetch('https://34.8.70.45.nip.io/test-news/v1/news/all');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading message
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // If there are articles, display them
            if (data.data && data.data.length > 0) {
                data.data.forEach(article => {
                    const card = createNewsCard(article);
                    newsContainer.appendChild(card);
                });
            } else {
                // If no articles, show a message
                newsContainer.innerHTML = '<div class="card"><div class="card-content"><h3 class="card-title">No news available</h3><p class="card-text">Please check back later for updates.</p></div></div>';
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            
            // Remove loading message and show error
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Show error message to user
            newsContainer.innerHTML = '<div class="card"><div class="card-content"><h3 class="card-title">Unable to load news</h3><p class="card-text">There was a problem loading the latest news. Please try again later.</p></div></div>';
        }
    }
    
    // Function to create a news card element
    function createNewsCard(article) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Format date
        const publishedDate = new Date(article.published_at);
        const formattedDate = publishedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="card-img">
                <img src="${article.image_url || '/api/placeholder/400/320'}" alt="${article.title}" onerror="this.src='/api/placeholder/400/320'">
                <span class="card-tag">${article.categories?.[0] || 'News'}</span>
            </div>
            <div class="card-content">
                <span class="card-date">${formattedDate}</span>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-text">${article.description || article.snippet || ''}</p>
                <a href="${article.url}" class="btn" target="_blank">Read More</a>
            </div>
        `;
        
        return card;
    }
    
    // Initialize news section
    fetchNews();
});