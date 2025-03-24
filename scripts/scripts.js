document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const inputField = document.getElementById('recipe-search');
    const resultsDiv = document.getElementById('results');
    const modal = document.getElementById('pop-up_modal');

    searchBtn.addEventListener('click', async () => {
        const ingredients = inputField.value.trim();

        if (!ingredients) {
            resultsDiv.innerHTML = '<p>Please enter some ingredients.</p>';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/recipes?ingredients=${encodeURIComponent(ingredients)}`);
            const recipes = await response.json();
            displayRecipes(recipes);
        } catch (error) {
            console.error(error);
            resultsDiv.innerHTML = '<p>Error fetching recipes.</p>';
        }
    });

    function displayRecipes(recipes) {
        resultsDiv.innerHTML = '';

        if (!recipes.length) {
            resultsDiv.innerHTML = '<p>No recipes found.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const titleSlug = recipe.title.toLowerCase().replace(/\s+/g, '-');
            const recipeUrl = `https://spoonacular.com/recipes/${titleSlug}-${recipe.id}`;

            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <h3>${recipe.title}</h3>
                <img src="${recipe.image}" alt="${recipe.title}">
                <p>Used ingredients: ${recipe.usedIngredientCount}</p>
                <p>Missed ingredients: ${recipe.missedIngredientCount}</p>
                <button class="view-btn" data-id="${recipe.id}">View Recipe</button>
            `;
            resultsDiv.appendChild(card);
        });

        // Attach click event for "View Recipe" buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    const res = await fetch(`http://localhost:5000/recipe/${id}`);
                    const data = await res.json();
        
                    showModal(data.title, data.instructions || '', data.sourceUrl);
                } catch (err) {
                    console.error(err);
                    showModal('Error', 'Could not load recipe instructions. Try again.');
                }
            });
        });
    }

    function showModal(title, instructions, sourceUrl = '') {
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>${title}</h2>
                <p>${instructions || 'No instructions available.'}</p>
                ${sourceUrl ? `<p><a href="${sourceUrl}" target="_blank">View original recipe</a></p>` : ''}
            </div>
        `;
        modal.style.display = 'block';

        document.querySelector('.close-btn').onclick = () => {
            modal.style.display = 'none';
        };
    }
});
