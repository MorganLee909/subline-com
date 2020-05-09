window.ingredientsStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            let categories = categorizeIngredients();

            let ingredientStrand = document.querySelector("#ingredientsStrand");
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
                headerButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
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

                    let spacer = document.createElement("p");
                    spacer.innerText = "-".repeat(25);
                    ingredientDiv.appendChild(spacer);

                    let ingredientData = document.createElement("p");
                    ingredientData.innerText = `${ingredient.quantity} ${ingredient.unit}`;
                    ingredientDiv.appendChild(ingredientData);
                }

                
            }

            this.isPopulated = true;
        }
    },

    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    },

    displayAddIngredient: function(){
        let sidebar = document.querySelector("#addIngredient");
        openSidebar(sidebar);

        // if(sidebar.classList.value === "sidebarHide"){
        //     sidebar.classList = "sidebar";
        // }else{
        //     sidebar.classList = "sidebarHide";
        // }
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

    
}