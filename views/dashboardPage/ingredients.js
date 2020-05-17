window.ingredientsStrandObj = {
    isPopulated: false,
    addIngredientsDiv: [],

    display: function(){
        if(!this.isPopulated){
            this.populateIngredients();

            this.isPopulated = true;
        }
    },

    populateIngredients: function(){
        let categories = categorizeIngredients(merchant.inventory);

        let ingredientStrand = document.querySelector("#categoryList");
        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }
        for(let category of categories){
            let categoryDiv = document.createElement("div");
            categoryDiv.classList = "categoryDiv"
            ingredientStrand.appendChild(categoryDiv);

            let headerDiv = document.createElement("div");
            categoryDiv.appendChild(headerDiv);
            
            let headerTitle = document.createElement("p");
            headerTitle.innerText = category.name;
            headerDiv.appendChild(headerTitle);

            let ingredientsDiv = document.createElement("div");
            ingredientsDiv.classList = "ingredientsDiv";
            ingredientsDiv.style.display = "none";
            categoryDiv.appendChild(ingredientsDiv);

            let headerButton = document.createElement("button");
            headerButton.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            headerButton.onclick = ()=>{this.toggleCategory(ingredientsDiv, headerButton)};
            headerDiv.appendChild(headerButton);

            for(let ingredient of category.ingredients){
                let ingredientDiv = document.createElement("div");
                ingredientDiv.classList = "ingredient";
                ingredientDiv.onclick = ()=>{this.displayIngredient(ingredient, category)};
                ingredientsDiv.appendChild(ingredientDiv);

                let ingredientName = document.createElement("p");
                ingredientName.innerText = ingredient.name;
                ingredientDiv.appendChild(ingredientName);

                let spacer = document.createElement("hr");
                spacer.classList = "ingredientSpacer";
                ingredientDiv.appendChild(spacer);

                let ingredientData = document.createElement("p");
                ingredientData.innerText = `${ingredient.quantity} ${ingredient.unit}`;
                ingredientDiv.appendChild(ingredientData);
            }
        }
    },

    //Open or close the list of ingredients for a category
    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    },

    displayAddIngredients: function(){
        let sidebar = document.querySelector("#addIngredients");
        let addIngredientsDiv = document.getElementById("addIngredientList");
        let categoryTemplate = document.getElementById("addIngredientsCategory");
        let ingredientTemplate = document.getElementById("addIngredientsIngredient");

        fetch("/ingredients")
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let categories = categorizeIngredientsFromDB(response);

                    this.addIngredientsDiv = [];
                    for(let i = 0; i < categories.length; i++){
                        let categoryDiv = categoryTemplate.content.children[0].cloneNode(true);
                        categoryDiv.children[0].children[0].innerText = categories[i].name;
                        categoryDiv.children[0].children[1].onclick = ()=>{this.toggleAddIngredient(categoryDiv)};
                        categoryDiv.children[1].style.display = "none";
                        categoryDiv.children[0].children[1].children[1].style.display = "none";

                        addIngredientsDiv.appendChild(categoryDiv);
                        
                        for(let j = 0; j < categories[i].ingredients.length; j++){
                            let ingredientDiv = ingredientTemplate.content.children[0].cloneNode(true);
                            ingredientDiv.children[1].innerText = categories[i].ingredients[j].name;
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

    displayIngredient: function(ingredient, category){
        sidebar = document.querySelector("#ingredientDetails");
        openSidebar(sidebar);

        document.querySelector("#ingredientDetails p").innerText = category.name;
        document.querySelector("#ingredientDetails h1").innerText = ingredient.name;
        document.querySelector("#ingredientStock").innerText = `${ingredient.quantity} ${ingredient.unit}`;

        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            quantities.push(ingredientSold(dateIndices(startDay, endDay), ingredient.id));
        }

        let sum = 0;
        for(let quantity of quantities){
            sum += quantity;
        }

        document.querySelector("#dailyUse").innerText = `${(sum/quantities.length).toFixed(2)} ${ingredient.unit}`;
    },

    submitAddIngredients: function(){
        let addIngredients = [];

        for(let i = 0; i < this.addIngredientsDiv.length; i++){
            let ingredient = this.addIngredientsDiv[i];

            if(ingredient.children[0].checked){
                if(!validator.ingredient.quantity(ingredient.children[2].value)){
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
                console.log(err);
                banner.createError("Unable to update data.  Please refresh the page");
            });
    }
}