window.ingredientsStrandObj = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            let categories = this.categorizeIngredients();

            let ingredientsStrand = document.querySelector("#ingredientsStrand");
            for(let category of categories){
                let categoryDiv = document.createElement("div");
                categoryDiv.classList = "categoryDiv"
                ingredientsStrand.appendChild(categoryDiv);

                let headerDiv = document.createElement("div");
                categoryDiv.appendChild(headerDiv);
                
                let headerTitle = document.createElement("p");
                headerTitle.innerText = category.name;
                headerDiv.appendChild(headerTitle);

                let headerButton = document.createElement("button");
                headerButton.innerText = "^";
                headerDiv.appendChild(headerButton);

                for(let ingredient of category.ingredients){
                    let ingredientDiv = document.createElement("div");
                    ingredientDiv.classList = "ingredient";
                    categoryDiv.appendChild(ingredientDiv);

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

    categorizeIngredients: function(){
        let ingredientsByCategory = [];

        for(let item of merchant.inventory){
            let categoryExists = false;
            for(let category of ingredientsByCategory){
                if(item.ingredient.category === category.name){
                    category.ingredients.push({
                        id: item.ingredient._id,
                        name: item.ingredient.name,
                        quantity: item.quantity,
                        unit: item.ingredient.unit
                    });

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: item.ingredient.category,
                    ingredients: [{
                        id: item.ingredient._id,
                        name: item.ingredient.name,
                        quantity: item.quantity,
                        unit: item.ingredient.unit
                    }]
                });
            }
        }

        console.log(ingredientsByCategory);

        return ingredientsByCategory;
    }
}