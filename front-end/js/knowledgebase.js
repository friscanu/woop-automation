/**
 * Knowledgebase JavaScript functionality
 * Handles search and category filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    // Category selection functionality
    const categories = document.querySelectorAll('.kb-category');
    const kbItems = document.querySelectorAll('.kb-item');
    const searchInput = document.querySelector('.kb-search-input');
    const searchForm = document.querySelector('.kb-search-form');
    
    // Handle category filtering
    categories.forEach(category => {
        category.addEventListener('click', function() {
            // Remove active class from all categories
            categories.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked category
            this.classList.add('active');
            
            const selectedCategory = this.textContent.trim();
            
            // Show all items if "All" is selected
            if (selectedCategory === 'All') {
                kbItems.forEach(item => {
                    item.style.display = 'block';
                });
                return;
            }
            
            // Filter items based on selected category
            kbItems.forEach(item => {
                const tags = item.querySelectorAll('.kb-item-tag');
                let matchFound = false;
                
                tags.forEach(tag => {
                    if (tag.textContent.trim() === selectedCategory) {
                        matchFound = true;
                    }
                });
                
                item.style.display = matchFound ? 'block' : 'none';
            });
        });
    });
    
    // Handle search functionality
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            kbItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        kbItems.forEach(item => {
            const title = item.querySelector('.kb-item-title').textContent.toLowerCase();
            const content = item.querySelector('p').textContent.toLowerCase();
            const tags = Array.from(item.querySelectorAll('.kb-item-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            if (
                title.includes(searchTerm) || 
                content.includes(searchTerm) || 
                tags.some(tag => tag.includes(searchTerm))
            ) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Reset category selection
        categories.forEach(c => c.classList.remove('active'));
        categories[0].classList.add('active'); // Select "All" category
    });
    
    // Clear search on input clear
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            kbItems.forEach(item => {
                item.style.display = 'block';
            });
            
            // Reset category selection
            categories.forEach(c => c.classList.remove('active'));
            categories[0].classList.add('active'); // Select "All" category
        }
    });
});