let addIngredientObj = {
    isPopulated: false,

    display: function(){
        controller.clearScreen();
        controller.addIngredientStrand.style.display = "flex";

        if(!this.isPopulated){
            this.populateIngredients();
            this.isPopulated = true;
        }
    },

    populateIngredients: function(){
        axios.get("/ingredients")
            .then((ingredients)=>{
                let select = document.querySelector("#addIngredientStrand select");

                for(let ingredient of ingredients.data){
                    let option = document.createElement("option");
                    option.value = ingredient._id;
                    option.innerText = `${ingredient.name} (${ingredient.unit})`;
                    select.appendChild(option);
                }
            })
            .catch((err)=>{
                banner.createError("Could not reach the database");
            });
    },

    submitAdd: function(){
        event.preventDefault();

        let item = {
            ingredient: document.querySelector("#addName").value,
            quantity: document.querySelector("#addQuantity").value
        }

        if(validator.ingredient.quantity){
            axios.post("/merchant/ingredients/create", item)
                .then((ingredient)=>{
                    item.ingredient = ingredient.data;
                    merchant.inventory.push(item);

                    inventoryObj.display();
                    inventoryObj.filter();
                })
                .catch((err)=>{
                    banner.createError("Something went wrong and the ingredient could not be added");
                });

            
        }
    }
}