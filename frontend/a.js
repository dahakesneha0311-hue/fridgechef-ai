function openRecipeForm() {
    const form = document.getElementById("recipeForm");

    if (form) {
        form.style.display = "flex";
    }
}

function closeRecipeForm() {
    const form = document.getElementById("recipeForm");

    if (form) {
        form.style.display = "none";
    }
}

async function generateRecipe() {

    const ingredients = document
        .getElementById("ingredients")
        .value
        .trim();

    const mealType =
        document.getElementById("mealType").value;

    const diet =
        document.getElementById("diet").value;

    const cookingTime =
        document.getElementById("cookingTime").value;

    if (!ingredients) {
        alert("Please enter your ingredients.");
        return;
    }

    const button =
        document.querySelector(".generate-btn");

    if (button) {
        button.disabled = true;
        button.innerHTML = "✨ Creating your recipe...";
    }

    showLoading();

    try {

        const response = await fetch("/api/recipe", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                ingredients,
                mealType,
                diet,
                cookingTime
            })
        });

        const recipe = await response.json();

        if (!response.ok) {
            throw new Error(
                recipe.error ||
                "Recipe generation failed."
            );
        }

        hideLoading();

        showRecipe(recipe);

    } catch (error) {

        hideLoading();

        console.error(error);

        alert(
            error.message ||
            "Unable to generate recipe."
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.innerHTML =
                "Generate My Recipe ✨";
        }
    }
}


function showLoading() {

    let loading =
        document.getElementById("aiLoading");

    if (!loading) {

        loading =
            document.createElement("div");

        loading.id = "aiLoading";

        loading.innerHTML = `
            <div class="loading-card">

                <div class="loading-spinner">
                    🍳
                </div>

                <h2>Creating something delicious...</h2>

                <p>
                    FridgeChef AI is cooking up
                    a recipe for you
                </p>

                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>
        `;

        document.body.appendChild(loading);
    }

    loading.style.display = "flex";
}


function hideLoading() {

    const loading =
        document.getElementById("aiLoading");

    if (loading) {
        loading.style.display = "none";
    }
}


function showRecipe(recipe) {

    let result =
        document.getElementById("recipeResult");

    if (!result) {

        result =
            document.createElement("div");

        result.id = "recipeResult";

        document.body.appendChild(result);
    }

    const savedRecipes =
        JSON.parse(
            localStorage.getItem("savedRecipes") || "[]"
        );

    const isSaved =
        savedRecipes.some(
            item => item.name === recipe.name
        );

    result.innerHTML = `

        <div class="recipe-card">

            <button
                class="close-recipe"
                onclick="closeRecipeResult()">
                ×
            </button>
            <div class="recipe-image">
            <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
            alt="${recipe.name}"
            >
            </div>

            <div class="recipe-header">

                <div class="recipe-icon">
                    🍳
                </div>

                <div>

                    <span class="ai-label">
                        AI GENERATED RECIPE
                    </span>

                    <h2>
                        ${recipe.name}
                    </h2>

                </div>

            </div>


            <div class="recipe-actions">

    <button
        onclick="saveRecipe()"
        class="action-btn"
        id="saveBtn">

        ${isSaved ? "❤️ Saved" : "🤍 Save"}

    </button>

    <button
        onclick="copyRecipe()"
        class="action-btn">

        📋 Copy

    </button>

</div>

<button
    onclick="createShoppingList()"
    class="shopping-list-btn">

    🛒 Create Shopping List

</button>   


            <div class="recipe-time">

                ⏱️ ${recipe.cookingTime}

            </div>


            <div class="recipe-section">

                <h3>
                    🥕 Ingredients
                </h3>

                <ul>

                    ${recipe.ingredients
                        .map(
                            item =>
                                `<li>${item}</li>`
                        )
                        .join("")}

                </ul>

            </div>


            <div class="recipe-section">

                <h3>
                    👩‍🍳 Instructions
                </h3>

                <ol>

                    ${recipe.instructions
                        .map(
                            step =>
                                `<li>${step}</li>`
                        )
                        .join("")}

                </ol>

            </div>


            <button
                class="generate-again"
                onclick="
                    closeRecipeResult();
                    openRecipeForm();
                ">

                ✨ Generate Another Recipe

            </button>

        </div>
    `;

    result.style.display = "block";

    window.currentRecipe = recipe;

    closeRecipeForm();
}


function createShoppingList() {

    if (!window.currentRecipe) {
        return;
    }

    const recipe = window.currentRecipe;

    let shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    recipe.ingredients.forEach(item => {

        if (!shoppingList.includes(item)) {
            shoppingList.push(item);
        }

    });

    localStorage.setItem(
        "shoppingList",
        JSON.stringify(shoppingList)
    );

    showShoppingList();
}


function showShoppingList() {

    const shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    let listBox =
        document.getElementById("shoppingListBox");

    if (!listBox) {

        listBox =
            document.createElement("div");

        listBox.id = "shoppingListBox";

        document.body.appendChild(listBox);
    }

    listBox.innerHTML = `

        <div class="shopping-card">

            <button
                class="close-shopping"
                onclick="closeShoppingList()">
                ×
            </button>

            <div class="shopping-title">

                <span>🛒</span>

                <div>
                    <span class="ai-label">
                        FRIDGECHEF AI
                    </span>

                    <h2>Shopping List</h2>
                </div>

            </div>

            <p class="shopping-subtitle">
                Everything you need for your recipe
            </p>

            <div class="shopping-items">

                ${
                    shoppingList.length
                        ? shoppingList.map(
                            (item, index) => `
                                <label class="shopping-item">

                                    <input
                                        type="checkbox"
                                        id="item${index}"
                                    >

                                    <span>
                                        ${item}
                                    </span>

                                </label>
                            `
                        ).join("")
                        : `
                            <p class="empty-shopping">
                                Your shopping list is empty.
                            </p>
                        `
                }

            </div>

            <div class="shopping-actions">

                <button
                    onclick="clearShoppingList()"
                    class="clear-shopping">
                    🗑 Clear List
                </button>

                <button
                    onclick="closeShoppingList()"
                    class="done-shopping">
                    ✓ Done
                </button>

            </div>

        </div>
    `;

    listBox.style.display = "flex";
}


function closeShoppingList() {

    const listBox =
        document.getElementById("shoppingListBox");

    if (listBox) {
        listBox.style.display = "none";
    }
}


function createShoppingList() {

    if (!window.currentRecipe) {
        return;
    }

    const recipe = window.currentRecipe;

    let shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    recipe.ingredients.forEach(item => {

        if (!shoppingList.includes(item)) {
            shoppingList.push(item);
        }

    });

    localStorage.setItem(
        "shoppingList",
        JSON.stringify(shoppingList)
    );

    showShoppingList();
}


function showShoppingList() {

    const shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    let listBox =
        document.getElementById("shoppingListBox");

    if (!listBox) {

        listBox =
            document.createElement("div");

        listBox.id = "shoppingListBox";

        document.body.appendChild(listBox);
    }

    listBox.innerHTML = `

        <div class="shopping-card">

            <button
                class="close-shopping"
                onclick="closeShoppingList()">
                ×
            </button>

            <div class="shopping-title">

                <span>🛒</span>

                <div>
                    <span class="ai-label">
                        FRIDGECHEF AI
                    </span>

                    <h2>Shopping List</h2>
                </div>

            </div>

            <p class="shopping-subtitle">
                Everything you need for your recipe
            </p>

            <div class="shopping-items">

                ${
                    shoppingList.length
                        ? shoppingList.map(
                            (item, index) => `
                                <label class="shopping-item">

                                    <input
                                        type="checkbox"
                                        id="item${index}"
                                    >

                                    <span>
                                        ${item}
                                    </span>

                                </label>
                            `
                        ).join("")
                        : `
                            <p class="empty-shopping">
                                Your shopping list is empty.
                            </p>
                        `
                }

            </div>

            <div class="shopping-actions">

                <button
                    onclick="clearShoppingList()"
                    class="clear-shopping">
                    🗑 Clear List
                </button>

                <button
                    onclick="closeShoppingList()"
                    class="done-shopping">
                    ✓ Done
                </button>

            </div>

        </div>
    `;

    listBox.style.display = "flex";
}


function closeShoppingList() {

    const listBox =
        document.getElementById("shoppingListBox");

    if (listBox) {
        listBox.style.display = "none";
    }
}


function createShoppingList() {

    if (!window.currentRecipe) {
        return;
    }

    const recipe = window.currentRecipe;

    let shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    recipe.ingredients.forEach(item => {

        if (!shoppingList.includes(item)) {
            shoppingList.push(item);
        }

    });

    localStorage.setItem(
        "shoppingList",
        JSON.stringify(shoppingList)
    );

    showShoppingList();
}


function showShoppingList() {

    const shoppingList =
        JSON.parse(
            localStorage.getItem("shoppingList") || "[]"
        );

    let listBox =
        document.getElementById("shoppingListBox");

    if (!listBox) {

        listBox =
            document.createElement("div");

        listBox.id = "shoppingListBox";

        document.body.appendChild(listBox);
    }

    listBox.innerHTML = `

        <div class="shopping-card">

            <button
                class="close-shopping"
                onclick="closeShoppingList()">
                ×
            </button>

            <div class="shopping-title">

                <span>🛒</span>

                <div>
                    <span class="ai-label">
                        FRIDGECHEF AI
                    </span>

                    <h2>Shopping List</h2>
                </div>

            </div>

            <p class="shopping-subtitle">
                Everything you need for your recipe
            </p>

            <div class="shopping-items">

                ${
                    shoppingList.length
                        ? shoppingList.map(
                            (item, index) => `
                                <label class="shopping-item">

                                    <input
                                        type="checkbox"
                                        id="item${index}"
                                    >

                                    <span>
                                        ${item}
                                    </span>

                                </label>
                            `
                        ).join("")
                        : `
                            <p class="empty-shopping">
                                Your shopping list is empty.
                            </p>
                        `
                }

            </div>

            <div class="shopping-actions">

                <button
                    onclick="clearShoppingList()"
                    class="clear-shopping">
                    🗑 Clear List
                </button>

                <button
                    onclick="closeShoppingList()"
                    class="done-shopping">
                    ✓ Done
                </button>

            </div>

        </div>
    `;

    listBox.style.display = "flex";
}


function closeShoppingList() {

    const listBox =
        document.getElementById("shoppingListBox");

    if (listBox) {
        listBox.style.display = "none";
    }
}


function createShoppingList() {

    if (!window.currentRecipe) {
        return;
    }

    const recipe = window.currentRecipe;

    let shoppingList = JSON.parse(
        localStorage.getItem("shoppingList") || "[]"
    );

    recipe.ingredients.forEach(item => {

        if (!shoppingList.includes(item)) {
            shoppingList.push(item);
        }

    });

    localStorage.setItem(
        "shoppingList",
        JSON.stringify(shoppingList)
    );

    showShoppingList();
}
function showShoppingList() {

    const shoppingList = JSON.parse(
        localStorage.getItem("shoppingList") || "[]"
    );

    let listBox =
        document.getElementById("shoppingListBox");

    if (!listBox) {

        listBox = document.createElement("div");

        listBox.id = "shoppingListBox";

        document.body.appendChild(listBox);
    }

    listBox.innerHTML = `
        <div class="shopping-card">

            <button
                class="close-shopping"
                onclick="closeShoppingList()">
                ×
            </button>

            <h2>🛒 Shopping List</h2>

            <p>Ingredients you need:</p>

            <div class="shopping-items">

                ${
                    shoppingList.length
                    ? shoppingList.map((item, index) => `
                        <label class="shopping-item">

                            <input
                                type="checkbox"
                                id="item${index}"
                            >

                            <span>${item}</span>

                        </label>
                    `).join("")
                    : `
                        <p>Your shopping list is empty.</p>
                    `
                }

            </div>

            <button
                onclick="clearShoppingList()"
                class="clear-shopping">

                🗑 Clear List

            </button>

        </div>
    `;

    listBox.style.display = "flex";
}


function copyRecipe() {

    if (!window.currentRecipe) {
        return;
    }

    const recipe =
        window.currentRecipe;

    const text = `

${recipe.name}

Cooking Time:
${recipe.cookingTime}

INGREDIENTS:

${recipe.ingredients
    .map(item => "• " + item)
    .join("\n")}

INSTRUCTIONS:

${recipe.instructions
    .map(
        (step, index) =>
            `${index + 1}. ${step}`
    )
    .join("\n")}

Generated by FridgeChef AI
`;

    navigator.clipboard
        .writeText(text)
        .then(() => {

            alert(
                "📋 Recipe copied successfully!"
            );

        })
        .catch(() => {

            alert(
                "Unable to copy recipe."
            );

        });
}


function closeRecipeResult() {

    const result =
        document.getElementById("recipeResult");

    if (result) {
        result.style.display = "none";
    }
}
function clearShoppingList() {

    localStorage.removeItem("shoppingList");

    showShoppingList();
}
function showSavedRecipes() {

    const savedRecipes = JSON.parse(
        localStorage.getItem("savedRecipes") || "[]"
    );

    let savedBox =
        document.getElementById("savedRecipesBox");

    if (!savedBox) {

        savedBox = document.createElement("div");

        savedBox.id = "savedRecipesBox";

        document.body.appendChild(savedBox);
    }

    savedBox.innerHTML = `

        <div class="saved-card">

            <button
                class="close-saved"
                onclick="closeSavedRecipes()">
                ×
            </button>

            <h2>❤️ Saved Recipes</h2>

            <p class="saved-subtitle">
                Your favourite FridgeChef recipes
            </p>

            <div class="saved-list">

                ${
                    savedRecipes.length
                    ? savedRecipes.map((recipe, index) => `

                        <div class="saved-recipe">

                            <div class="saved-recipe-icon">
                                🍳
                            </div>

                            <div class="saved-recipe-info">

                                <h3>
                                    ${recipe.name}
                                </h3>

                                <p>
                                    ⏱️ ${recipe.cookingTime}
                                </p>

                            </div>

                        </div>

                    `).join("")
                    : `
                        <div class="empty-saved">

                            <div>🍽️</div>

                            <h3>No saved recipes yet</h3>

                            <p>
                                Generate a recipe and press
                                ❤️ Save to see it here.
                            </p>

                        </div>
                    `
                }

            </div>

        </div>
    `;

    savedBox.style.display = "flex";
}


function closeSavedRecipes() {

    const savedBox =
        document.getElementById("savedRecipesBox");

    if (savedBox) {
        savedBox.style.display = "none";
    }
}