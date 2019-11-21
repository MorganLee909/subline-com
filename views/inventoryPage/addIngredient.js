let addIngredientsObj = {
    display: function(){
        controller.clearScreen();
        controller.addIngredientStrand.style.display = "flex";
    },
    
    //Fixerup
    //Display the modal to allow for adding a new ingredient
    displayAdd: function(){
        document.querySelector("#existingIngredient").style.display = "block";
        document.querySelector("#quantityInput").style.display = "none";
        document.querySelector("#newIngredient").style.display = "none";
        document.querySelector("#createNew").onclick = ()=>{this.displayNew();};

        let modal = document.querySelector(".add-ingredient");

        let removeModal = (modal)=>{modal.style.visibility = "hidden";}

        modal.onclick = ()=>{removeModal(modal);};

        modal.style.visibility = "visible";

        axios.get("/ingredients")
            .then((ingredients)=>{
                let tbody = document.querySelector("#existingIngredient table tbody");

                while(tbody.children.length > 0){
                    tbody.removeChild(tbody.firstChild);
                }

                for(let ingredient of ingredients.data){
                    let row = document.createElement("tr");
                    tbody.appendChild(row);

                    let name = document.createElement("td");
                    name.innerText = ingredient.name;
                    row.appendChild(name);

                    let category = document.createElement("td");
                    category.innerText = ingredient.category;
                    row.appendChild(category);

                    let unit = document.createElement("td");
                    unit.innerText = ingredient.unit;
                    row.appendChild(unit);

                    let addButton = document.createElement("button");
                    addButton.innerText = "Add";
                    addButton.onclick = ()=>{this.configureAddIngredient(ingredient);};
                    row.appendChild(addButton);
                }
            })
            .catch((err)=>{
                banner.createError("Failed to retrieve ingredients list");
            });
    },

    configureAddIngredient: function(ingredient){
        document.querySelector("#existingIngredient").style.display = "none";
        document.querySelector("#quantityInput").style.display = "block";
        document.querySelector("#newIngredient").style.display = "none";
        
        document.querySelector("#quantityInputTitle").innerText = `${ingredient.name} (${ingredient.unit})`;

        let button = document.querySelector("#addIngredient");
        let input = document.querySelector("#quantityInput input");

        button.onclick = ()=>{this.addIngredient({ingredient: ingredient, quantity: input.value});};
    },

    createIngredient: function(){
        let newItem = {
            ingredient: {
                name: document.querySelector("#newName").value,
                category: document.querySelector("#newCategory").value,
                unit: document.querySelector("#newUnit").value
            },
            quantity: document.querySelector("#newQuantity").value
        }

        this.addIngredient(newItem);
    },

    //Update new ingredient on both the page and the database
    //Close the modal
    addIngredient: function(item){
        if(validator.ingredient.all(item.ingredient, item.quantity)){
            merchant.inventory.push(item);
            if(item.ingredient._id){
                axios.post("/merchant/ingredients/create", item)
                    .then((newMerchant)=>{
                        this.filter();
                        banner.createNotification("The new ingredient has been successfully added to your inventory");
                    })
                    .catch((err)=>{
                        banner.createError("There was an error and the ingredient could not be added to your inventory");
                        console.log(err);
                    });
            }else{
                axios.post("/ingredients/createone", item)
                    .then((newMerchant)=>{
                        this.filter();
                        banner.createNotification("The new ingredient has been successfully added to your inventory");
                    })
                    .catch((err)=>{
                        console.log(err);
                        banner.createError("There was an error and the ingredient could not be added to your inventory");
                    });
            }
        }

        let modal = document.querySelector(".add-ingredient");
        modal.style.visibility = "hidden";
    }
}