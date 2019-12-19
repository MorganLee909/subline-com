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
            .then((response)=>{
                if(typeof(response.data) === "string"){
                    banner.createError(response.data);
                }else{
                    let select = document.querySelector("#addIngredientStrand select");

                    for(let ingredient of response.data){
                        let option = document.createElement("option");
                        option.value = ingredient._id;
                        option.innerText = `${ingredient.name} (${ingredient.unit})`;
                        select.appendChild(option);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("Error: Could not retrieve ingredients");
                inventoryObj.display();
            });
    },

    submitAdd: function(){
        event.preventDefault();

        let item = {
            ingredient: document.querySelector("#addName").value,
            quantity: document.querySelector("#addQuantity").value
        }

        if(validator.ingredient.quantity(item.quantity)){
            axios.post("/merchant/ingredients/create", item)
                .then((ingredient)=>{
                    if(typeof(ingredient.data) === "string"){
                        banner.createError(ingredient.data);
                    }else{
                        merchant.inventory.push(ingredient.data);

                        inventoryObj.display();
                        inventoryObj.filter();
                    }
                })
                .catch((err)=>{
                    banner.createError("Error: Unable to add ingredient");
                });
        }
    },

    submitNew: function(){
        event.preventDefault();

        let ingredient = {
            name: document.querySelector("#newName").value,
            category: document.querySelector("#newCategory").value,
            unit: document.querySelector("#newUnit").value
        }

        let quantity = document.querySelector("#newQuantity").value;

        if(validator.ingredient.all(ingredient, quantity)){
            axios.post("/ingredients/createone", {ingredient: ingredient, quantity: quantity})
                .then((response)=>{
                    if(typeof(response.data) === "string"){
                        banner.createError(response.data);
                    }else{
                        merchant.inventory.push(response.data);

                        inventoryObj.display();
                        inventoryObj.filter();
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong and the ingredient could not be created");
                });
        }
    }
}