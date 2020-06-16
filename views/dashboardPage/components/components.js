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
            ingredientDiv.ingredient = recipe.ingredients[i].ingredient;
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

        if(merchant.pos === "none"){
            let name = document.querySelector("#recipeName");
            let nameIn = document.querySelector("#recipeNameIn");
            name.style.display = "none";
            nameIn.style.display = "block";
            nameIn.placeholder = name.innerText;

            let price = document.querySelector("#recipePrice");
            price.children[1].style.display = "none";
            price.children[2].style.display = "block";
            price.children[2].placeholder = price.children[1].innerText;
        }

        for(let i = 0; i < ingredientDivs.children.length; i++){
            let div = ingredientDivs.children[i];

            div.children[2].innerText = this.recipe.ingredients[i].ingredient.unit;
            div.children[1].style.display = "block";
            div.children[1].placeholder = this.recipe.ingredients[i].quantity;
            div.children[3].style.display = "block";
            div.children[3].onclick = ()=>{div.parentElement.removeChild(div)};
        }

        document.querySelector("#addRecIng").style.display = "flex";

        

        document.querySelector("#recipeUpdate").style.display = "flex";
    },

    update: function(){
        this.recipe.name = document.querySelector("#recipeNameIn").value || this.recipe.name;
        this.recipe.price = Math.round((document.querySelector("#recipePrice").children[2].value * 100)) || this.recipe.price;
        this.recipe.ingredients = [];

        let divs = document.querySelector("#recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                let select = divs[i].children[0];
                this.recipe.ingredients.push({
                    ingredient: select.options[select.selectedIndex].ingredient,
                    quantity: divs[i].children[1].value
                })
            }else{
                this.recipe.ingredients.push({
                    ingredient: divs[i].ingredient,
                    quantity: divs[i].children[1].value || divs[i].children[1].placeholder
                });
            }
        }

        let data = {
            id: this.recipe.id,
            name: this.recipe.name,
            price: this.recipe.price,
            ingredients: []
        }

        for(let i = 0; i < this.recipe.ingredients.length; i++){
            data.ingredients.push({
                ingredient: this.recipe.ingredients[i].ingredient.id,
                quantity: this.recipe.ingredients[i].quantity
            });
        }

        fetch("/recipe/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editRecipe(this.recipe);
                    banner.createNotification("Recipe successfully updated");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong.  Please refresh the page");
            })
    },

    remove: function(){
        fetch(`/merchant/recipes/remove/${this.recipe.id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editRecipe(this.recipe, true);
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

        let categories = merchant.categorizeIngredients();

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                option.ingredient = categories[i].ingredients[j].ingredient;
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
                        merchant.editIngredients([{
                            ingredient: new Ingredient(
                                response.ingredient._id,
                                response.ingredient.name,
                                response.ingredient.category,
                                response.ingredient.unit
                            ),
                            quantity: response.quantity
                        }]);

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

        document.querySelector("#removeOrderBtn").onclick = ()=>{this.remove(order._id)};

        document.querySelector("#orderDetails h1").innerText = order.orderId || order._id;
        document.querySelector("#orderDetails h3").innerText = new Date(order.date).toLocaleDateString("en-US");

        let ingredientList = document.querySelector("#orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#orderIngredient").content.children[0];
        let grandTotal = 0;
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredient = template.cloneNode(true);
            let price = (order.ingredients[i].quantity * order.ingredients[i].price) / 100;
            grandTotal += price;

            for(let j = 0; j < merchant.inventory.length; j++){
                if(order.ingredients[i].ingredient === merchant.inventory[j].ingredient._id){
                    ingredient.children[0].innerText = `${merchant.inventory[j].ingredient.name}: ${order.ingredients[i].quantity}`;
                    break;
                }
            }

            ingredient.children[1].innerText = `$${(order.ingredients[i].price / 100).toFixed(2)}`;
            ingredient.children[2].innerText = price.toFixed(2);

            ingredientList.appendChild(ingredient);
        }

        document.querySelector("#orderTotalPrice p").innerText = `$${grandTotal.toFixed(2)}`;
    },

    remove: function(id){
        fetch(`/order/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    updateOrders({_id: id}, true);
                    banner.createNotification("Order successfully removed");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong, try refreshing the page");
            });
    }
}

let addIngredientsComp = {
    isPopulated: false,
    fakeMerchant: {},
    chosenIngredients: [],

    display: function(){
        let sidebar = document.querySelector("#addIngredients");

        if(!this.isPopulated){
            fetch("/ingredients")
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < merchant.ingredients.length; i++){
                            for(let j = 0; j < response.length; j++){
                                if(merchant.ingredients[i].ingredient.id === response[j]._id){
                                    response.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        
                        for(let i = 0; i < response.length; i++){
                            response[i] = {ingredient: response[i]}
                        }
                        this.fakeMerchant = new Merchant(
                            {
                                name: "none",
                                inventory: response,
                                recipes: [],
                            },
                            []
                        );

                        this.populateAddIngredients();
                    }
                })
                .catch((err)=>{
                    banner.createError("Unable to retrieve data");
                });

            this.isPopulated = true;
        }

        openSidebar(sidebar);
    },

    populateAddIngredients: function(){
        let addIngredientsDiv = document.getElementById("addIngredientList");
        let categoryTemplate = document.getElementById("addIngredientsCategory");
        let ingredientTemplate = document.getElementById("addIngredientsIngredient");

        let categories = this.fakeMerchant.categorizeIngredients();

        while(addIngredientsDiv.children.length > 0){
            addIngredientsDiv.removeChild(addIngredientsDiv.firstChild);
        }
        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.content.children[0].cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            categoryDiv.children[0].children[1].onclick = ()=>{addIngredientsComp.toggleAddIngredient(categoryDiv)};
            categoryDiv.children[1].style.display = "none";
            categoryDiv.children[0].children[1].children[1].style.display = "none";

            addIngredientsDiv.appendChild(categoryDiv);
            
            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredientDiv = ingredientTemplate.content.children[0].cloneNode(true);
                ingredientDiv.children[0].innerText = categories[i].ingredients[j].ingredient.name;
                ingredientDiv.ingredient = categories[i].ingredients[j].ingredient;

                categoryDiv.children[1].appendChild(ingredientDiv);
            }
        }
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

    addOne: function(element){
        element.parentElement.removeChild(element);
        document.getElementById("myIngredients").appendChild(element);
        document.getElementById("myIngredientsDiv").style.display = "flex";

        for(let i = 0; i < this.fakeMerchant.ingredients.length; i++){
            if(this.fakeMerchant.ingredients[i].ingredient === element.ingredient){
                this.fakeMerchant.ingredients.splice(i, 1);
                this.chosenIngredients.push(element.ingredient);
                break;
            }
        }

        let input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "0.01";
        input.placeholder = element._unit;
        element.insertBefore(input, element.children[1]);

        element.children[2].innerText = "-";
        element.children[2].onclick = ()=>{this.removeOne(element)};
    },

    removeOne: function(element){
        element.parentElement.removeChild(element);

        element.removeChild(element.children[1]);

        element.children[1].innerText = "+";
        element.children[1].onclick = ()=>{this.addOne(element)};

        if(document.getElementById("myIngredients").children.length === 0){
            document.getElementById("myIngredientsDiv").style.display = "none";
        }

        for(let i = 0; i < this.chosenIngredients.length; i++){
            if(this.chosenIngredients[i] === element.ingredient){
                this.chosenIngredients.splice(i, 1);
                this.fakeMerchant.ingredients.push({
                    ingredient: element.ingredient
                });
                break;
            }
        }
        this.populateAddIngredients();
    },

    submit: function(){
        let ingredients = document.getElementById("myIngredients").children;
        let newIngredients = [];
        let fetchable = [];

        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].children[1].value === ""){
                banner.createError("Please enter a quantity for each ingredient you want to add to your inventory");
                return;
            }

            newIngredients.push({
                ingredient: ingredients[i].ingredient,
                quantity: ingredients[i].children[1].value
            });

            fetchable.push({
                id: ingredients[i].ingredient.id,
                quantity: ingredients[i].children[1].value
            });
        }

        fetch("/merchant/ingredients/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(fetchable)
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editIngredients(newIngredients);
                    banner.createNotification("All ingredients added successfully");
                }
            })
            .catch((err)=>{
                banner.createError("Something went wrong.  Try refreshing the page");
            });
    }
}

let ingredientDetailsComp = {
    ingredient: {},

    display: function(ingredient, category){
        this.ingredient = ingredient;

        sidebar = document.querySelector("#ingredientDetails");

        document.querySelector("#ingredientDetails p").innerText = category.name;
        document.querySelector("#ingredientDetails h1").innerText = ingredient.ingredient.name;
        document.querySelector("#ingredientStock").innerText = `${ingredient.quantity} ${ingredient.ingredient.unit}`;
        document.querySelector("#ingredientInput").placeholder = `${ingredient.quantity} ${ingredient.ingredient.unit}`;

        let quantities = [];
        let now = new Date();
        console.time("Single Ingredient Sold");
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            let indices = merchant.transactionIndices(startDay, endDay);

            if(indices === false){
                quantities.push(0);
            }else{
                quantities.push(merchant.singleIngredientSold(indices, ingredient));
            }
        }
        console.timeEnd("Single Ingredient Sold");

        let sum = 0;
        for(let quantity of quantities){
            sum += quantity;
        }

        document.querySelector("#dailyUse").innerText = `${(sum/quantities.length).toFixed(2)} ${ingredient.ingredient.unit}`;

        let ul = document.querySelector("#ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                changeStrand("recipeBookStrand");
                recipeDetailsComp.display(recipes[i]);
            }
            ul.appendChild(li);
        }

        openSidebar(sidebar);
    },

    remove: function(){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(this.ingredient.id === merchant.recipes[i].ingredients[j].ingredient._id){
                    banner.createError("Must remove ingredient from all recipes before removing");
                    return;
                }
            }
        }

        fetch(`/merchant/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("Ingredient removed");
                    merchant.editIngredients([this.ingredient], true);
                }
            })
            .catch((err)=>{});
    },

    edit: function(){
        document.querySelector("#ingredientStock").style.display = "none";
        document.querySelector("#ingredientInput").style.display = "block";
        document.querySelector("#editSubmitButton").style.display = "block";
    },

    editSubmit: function(){
        this.ingredient.quantity = Number(document.getElementById("ingredientInput").value);
        let data = [{
            id: this.ingredient.ingredient.id,
            quantity: this.ingredient.quantity
        }];

        if(validator.ingredientQuantity(data[0].quantity)){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        merchant.editIngredients([this.ingredient]);
                        banner.createNotification("Ingredient updated");
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong, try refreshing the page");
                });
        }
    }
}

let newRecipeComp = {
    display: function(){
        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = merchant.categorizeIngredients();
        for(let category of categories){
            let optgroup = document.createElement("optgroup");
            optgroup.label = category.name;
            ingredientsSelect.appendChild(optgroup);

            for(let ingredient of category.ingredients){
                let option = document.createElement("option");
                option.value = ingredient.ingredient.id;
                option.innerText = ingredient.ingredient.name;
                optgroup.appendChild(option);
            }
        }

        openSidebar(document.querySelector("#addRecipe"));
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.querySelector("#ingredientCount").value;
        let ingredientsDiv = document.querySelector("#recipeInputIngredients");
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = ingredientsDiv.children[0].cloneNode(true);
                newNode.children[2].children[0].value = "";

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `Ingredient ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(){
        let newRecipe = {
            name: document.querySelector("#newRecipeName").value,
            price: document.querySelector("#newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.querySelectorAll("#recipeInputIngredients > div");
        for(let input of inputs){
            newRecipe.ingredients.push({
                ingredient: input.children[1].children[0].value,
                quantity: input.children[2].children[0].value
            });
        }

        if(!validator.recipe(newRecipe)){
            return;
        }

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let recipe = new Recipe(
                        response._id,
                        response.name,
                        response.price,
                        response.ingredients,
                        merchant,
                    );
                    
                    merchant.editRecipe(recipe);
                    banner.createNotification("New recipe successfully created");
                }
            })
            .catch((err)=>{
                banner.createError("Refresh page to update data");
            });
    },
}