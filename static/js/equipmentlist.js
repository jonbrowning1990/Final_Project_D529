// static/js/order.js
document.addEventListener('DOMContentLoaded', () => {

    const itemizedListDiv = document.getElementById('itemized-list');
    const urlParams = new URLSearchParams(window.location.search);
    const jsonParams = Object.fromEntries(urlParams.entries());
    async function fetchData() {
        try {
            const response = await fetch('/api/equipmentlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonParams)
            });
            const result = await response.json();



            if (response.ok) {
                alert('Retrieval Successful');
            }
            else {
                alert('Estimate lookup failed: ' + result.error);
                console.error('Server error:', result);
            }

            for (const key in result) {
                const categoryHeading = document.createElement('h4');
                categoryHeading.className = 'font-semibold text-gray-700 mt-4 mb-2 first:mt-0';
                categoryHeading.textContent = key;
                itemizedListDiv.appendChild(categoryHeading);
                const ul = document.createElement('ul');
                ul.className = 'list-none p-0 m-0 text-sm';

                for (const item of result[key]) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${item['quantity']}</span>
                        <span>${item['name']}</span>
                    `;
                    ul.appendChild(li);
                };
                itemizedListDiv.appendChild(ul);
            };

        } catch (error) {
            console.error('Error getting estimate:', error);
            alert('Estimate lookup failed.');
        }
    }
    fetchData();
});

