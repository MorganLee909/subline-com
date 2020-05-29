let recipeDetailsComp = {
    recipe: {},

    display: function(recipe){
        this.recipe = recipe;
        openSidebar(document.querySelector("#recipeDetails"));

        document.querySelector("#recipeName").style.display = "block";
        document.querySelector("#recipeNameIn").style.display = "none";
        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.querySelector("#recipeIngredientList");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            ingredientDiv = template.cloneNode(true);

            ingredientDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `${recipe.ingredients[i].quantity} ${recipe.ingredients[i].ingredient.unit}`;
            ingredientDiv._id = recipe.ingredients[i].ingredient._id;
            ingredientDiv.name = recipe.ingredients[i].ingredient.name;

            ingredientList.appendChild(ingredientDiv);
        }

        document.querySelector("#addRecIng").style.display = "none";

        let price = document.querySelector("#recipePrice");
        price.children[1].style.display = "block";
        price.children[2].style.display = "none";
        price.children[1].innerText = `$${(recipe.price / 100).toFixed(2)}`;

        document.querySelector("#recipeUpdate").style.display = "none";
    },

    edit: function(){
        let ingredientDivs = document.querySelector("#recipeIngredientList");

        let name = document.querySelector("#recipeName");
        let nameIn = document.querySelector("#recipeNameIn");
        name.style.display = "none";
        nameIn.style.display = "block";
        nameIn.placeholder = name.innerText;

        for(let i = 0; i < ingredientDivs.children.length; i++){
            let div = ingredientDivs.children[i];

            div.children[2].innerText = this.recipe.ingredients[i].ingredient.unit;
            div.children[1].style.display = "block";
            div.children[1].placeholder = this.recipe.ingredients[i].quantity;
            div.children[3].style.display = "block";
            div.children[3].onclick = ()=>{div.parentElement.removeChild(div)};
        }

        document.querySelector("#addRecIng").style.display = "flex";

        let price = document.querySelector("#recipePrice");
        price.children[1].style.display = "none";
        price.children[2].style.display = "block";
        price.children[2].placeholder = price.children[1].innerText;

        document.querySelector("#recipeUpdate").style.display = "flex";
    },

    update: function(){
        let updatedRecipe = {
            _id: this.recipe._id,
            name: document.querySelector("#recipeNameIn").value || this.recipe.name,
            price: Math.round((document.querySelector("#recipePrice").children[2].value * 100)) || this.recipe.price,
            ingredients: []
        }

        let divs = document.querySelector("#recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                updatedRecipe.ingredients.push({
                    ingredient: divs[i].children[0].value,
                    quantity: divs[i].children[1].value
                })
            }else{
                updatedRecipe.ingredients.push({
                    ingredient: divs[i]._id,
                    quantity: divs[i].children[1].value || divs[i].children[1].placeholder
                });
            }
        }

        if(validator.recipe(updatedRecipe)){
            fetch("/recipe/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(updatedRecipe)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        updateRecipes(updatedRecipe);
                        banner.createNotification("Recipe successfully updated");
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong.  Please refresh the page");
                })
        }
    },

    remove: function(){
        fetch(`/merchant/recipes/remove/${this.recipe._id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    updateRecipes(this.recipe, true);
                    banner.createNotification("Recipe removed");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong.  Try refreshing the page");
            });
    },

    displayAddIngredient: function(){
        let template = document.querySelector("#addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.querySelector("#recipeIngredientList").appendChild(template);

        let categories = categorizeIngredients(merchant.inventory);

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].name} (${categories[i].ingredients[j].unit})`;
                option.value = categories[i].ingredients[j].id;
                optGroup.appendChild(option);
            }
        }
    }
}

let newOrderComp = {
    isPopulated: false,

    display: function(){
        openSidebar(document.querySelector("#newOrder"));

        if(!this.isPopulated){
            let categories = categorizeIngredients(merchant.inventory);
            let categoriesList = document.querySelector("#newOrderCategories");
            let template = document.querySelector("#addIngredientsCategory").content.children[0];
            let ingredientTemplate = document.querySelector("#addIngredientsIngredient").content.children[0];

            for(let i = 0; i < categories.length; i++){
                let category = template.cloneNode(true);

                category.children[0].children[0].innerText = categories[i].name;
                category.children[0].children[1].onclick = ()=>{addIngredientsComp.toggleAddIngredient(category)};
                category.children[0].children[1].children[1].style.display = "none";
                category.children[1].style.display = "none";
                
                categoriesList.appendChild(category);

                for(let j = 0; j < categories[i].ingredients.length; j++){
                    let ingredientDiv = ingredientTemplate.cloneNode(true);

                    ingredientDiv.children[0].innerText = categories[i].ingredients[j].name;
                    ingredientDiv.children[1].placeholder = categories[i].ingredients[j].unit;
                    ingredientDiv._id = categories[i].ingredients[j].id;
                    ingredientDiv._name = categories[i].ingredients[j].name;
                    ingredientDiv._unit = categories[i].ingredients[j].unit;
                    ingredientDiv._category = categories[i].name;
                    
                    let priceInput = document.createElement("input");
                    priceInput.type = "number";
                    priceInput.min = "0";
                    priceInput.step = "0.01";
                    priceInput.placeholder = "Price Per Unit";
                    ingredientDiv.appendChild(priceInput);

                    category.children[1].appendChild(ingredientDiv);
                }
            }

            this.isPopulated = true;
        }
    },

    submit: function(){
        let categoriesList = document.querySelector("#newOrderCategories");

        let newOrder = {
            orderId: document.querySelector("#orderName").value,
            date: new Date(document.querySelector("#orderDate").value),
            ingredients: []
        }

        for(let i = 0; i < categoriesList.children.length; i++){
            for(let j = 0; j < categoriesList.children[i].children[1].children.length; j++){
                let ingredientDiv = categoriesList.children[i].children[1].children[j];
                let quantity = ingredientDiv.children[1].value;
                let price = ingredientDiv.children[2].value;

                if(quantity !== ""  || price !== ""){
                    let newIngredient = {
                        id: ingredientDiv._id,
                        ingredient: ingredientDiv._id,
                        quantity: parseFloat(quantity),
                        price: parseInt(price * 100)
                    }

                    newOrder.ingredients.push(newIngredient);
                }
            }
        }
        
        if(validator.order(newOrder)){
            fetch("/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newOrder)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        banner.createNotification("New order created");
                        updateOrders(newOrder);
                        updateInventory(newOrder.ingredients);
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong.  Try refreshing the page");
                });
        }
    },
}

let newIngredientComp = {
    display: function(){
        openSidebar(document.querySelector("#newIngredient"));

        document.querySelector("#newIngName").value = "";
        document.querySelector("#newIngCategory").value = "";
        document.querySelector("#newIngQuantity").value = 0;
        document.querySelector("#newIngUnit").value = ""
    },

    submit: function(){
        let newIngredient = {
            ingredient: {
                name: document.querySelector("#newIngName").value,
                category: document.querySelector("#newIngCategory").value,
                unit: document.querySelector("#newIngUnit").value
            },
            quantity: document.querySelector("#newIngQuantity").value
        }

        if(validator.ingredient(newIngredient)){
            fetch("/ingredients/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newIngredient)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        updateInventory([response]);
                        banner.createNotification("Ingredient successfully created");
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong.  Try refreshing the page");
                });
        }
    }
}

let orderDetailsComp = {
    display: function(order){
        openSidebar(document.querySelector("#orderDetails"));

        document.querySelector("#orderDetails h1").innerText = order.orderId || order._id;
        document.querySelector("#orderDetails h3").innerText = new Date(order.date).toLocaleDateString("en-US");

        let ingredientList = document.querySelector("#orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredient = template.cloneNode(true);

            for(let j = 0; j < merchant.inventory.length; j++){
                if(order.ingredients[i].ingredient === merchant.inventory[j].ingredient._id){
                    ingredient.children[0].innerText = `${merchant.inventory[j].ingredient.name}: ${order.ingredients[i].quantity}`;
                    break;
                }
            }

            ingredient.children[1].innerText = `$${(order.ingredients[i].price / 100).toFixed(2)}`;
            ingredient.children[2].innerText = ((order.ingredients[i].quantity * order.ingredients[i].price) / 100).toFixed(2);

            ingredientList.appendChild(ingredient);
        }
    }
}

let addIngredientsComp = {
    isPopulated: false,

    display: function(){
        let sidebar = document.querySelector("#addIngredients");

        if(!this.isPopulated){
            let addIngredientsDiv = document.getElementById("addIngredientList");
            let categoryTemplate = document.getElementById("addIngredientsCategory");
            let ingredientTemplate = document.getElementById("addIngredientsIngredient");

            fetch("/ingredients")
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < merchant.inventory.length; i++){
                            for(let j = 0; j < response.length; j++){
                                if(merchant.inventory[i].ingredient._id === response[j]._id){
                                    response.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        let categories = categorizeIngredientsFromDB(response);

                        while(addIngredientsDiv.children.length > 0){
                            addIngredientsDiv.removeChild(addIngredientsDiv.firstChild);
                        }
                        this.addIngredientsDiv = [];
                        for(let i = 0; i < categories.length; i++){
                            let categoryDiv = categoryTemplate.content.children[0].cloneNode(true);
                            categoryDiv.children[0].children[0].innerText = categories[i].name;
                            categoryDiv.children[0].children[1].onclick = ()=>{addIngredientsComp.toggleAddIngredient(categoryDiv)};
                            categoryDiv.children[1].style.display = "none";
                            categoryDiv.children[0].children[1].children[1].style.display = "none";

                            addIngredientsDiv.appendChild(categoryDiv);
                            
                            for(let j = 0; j < categories[i].ingredients.length; j++){
                                let ingredientDiv = ingredientTemplate.content.children[0].cloneNode(true);
                                ingredientDiv.children[0].innerText = categories[i].ingredients[j].name;
                                ingredientDiv._id = categories[i].ingredients[j].id;
                                ingredientDiv._name = categories[i].ingredients[j].name;
                                ingredientDiv._unit = categories[i].ingredients[j].unit;
                                ingredientDiv._category = categories[i].name;

                                categoryDiv.children[1].appendChild(ingredientDiv);

                                this.addIngredientsDiv.push(ingredientDiv);
                            }
                        }
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to retrieve data");
                });

            this.isPopulated = true;
        }

        openSidebar(sidebar);
    },

    toggleAddIngredient: function(categoryElement){
        let button = categoryElement.children[0].children[1];
        let ingredientDisplay = categoryElement.children[1];

        if(ingredientDisplay.style.display === "none"){
            ingredientDisplay.style.display = "flex";

            button.children[0].style.display = "none";
            button.children[1].style.display = "block";
        }else{
            ingredientDisplay.style.display = "none";

            button.children[0].style.display = "block";
            button.children[1].style.display = "none";
        }
    },

    submitAddIngredients: function(){
        let addIngredients = [];

        for(let i = 0; i < this.addIngredientsDiv.length; i++){
            let ingredient = this.addIngredientsDiv[i];

            if(ingredient.children[0].checked){
                if(!validator.ingredientQuantity(ingredient.children[2].value)){
                    return;
                }

                addIngredients.push({
                    ingredient: {
                        _id: ingredient._id,
                        name: ingredient._name,
                        category: ingredient._category,
                        unit: ingredient._unit
                    },
                    quantity: ingredient.children[2].value,
                });
            }
        }

        if(addIngredients.length > 0){
            fetch("/merchant/ingredients/add", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(addIngredients)
            })
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        banner.createNotification("Ingredients added");
                        updateInventory(addIngredients);
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to update data.  Please refresh the page");
                });
        }
    }
}