// static/js/bar.js
document.addEventListener('DOMContentLoaded', () => {
    const barItemsListDiv = document.getElementById('bar-items-list');

    /**
     * Fetches bar items from the Flask API and renders them on the page.
     */
    async function fetchAndRenderBarItems() {
        try {
            const response = await fetch('/api/bar_items');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }
            const barData = await response.json();
            
            barItemsListDiv.innerHTML = ''; // Clear "Loading bar offerings..."

            if (Object.keys(barData).length === 0) {
                barItemsListDiv.innerHTML = `
                    <p class="text-center text-gray-500 text-xl py-10">
                        No bar items available at the moment. Please check back later!
                    </p>
                `;
                return;
            }

            for (const categoryName in barData) {
                const categoryItems = barData[categoryName];

                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';

                categorySection.innerHTML = `
                    <h2 class="category-title">${categoryName}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Items for this category will go here -->
                    </div>
                `;
                barItemsListDiv.appendChild(categorySection);

                const itemsGrid = categorySection.querySelector('div.grid');

                if (categoryItems.length === 0) {
                    itemsGrid.innerHTML = `<p class="text-gray-500 italic text-sm text-center col-span-full">No items available in this category yet.</p>`;
                } else {
                    categoryItems.forEach(item => {
                        const itemCard = document.createElement('div');
                        itemCard.className = 'item-card';
                        itemCard.innerHTML = `
                            <div>
                                <h3 class="item-name">${item.name}</h3>
                            </div>
                            <span class="item-price">$${item.price.toFixed(2)}</span>
                        `;
                        itemsGrid.appendChild(itemCard);
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching bar items:", error);
            barItemsListDiv.innerHTML = `
                <div class="text-center text-red-600 p-4 bg-red-100 rounded-lg">
                    <p class="font-bold">Failed to load bar items.</p>
                    <p>Please try again later.</p>
                    <p class="text-sm text-red-500">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    // Call the function to fetch and render bar items when the page loads
    fetchAndRenderBarItems();
});

