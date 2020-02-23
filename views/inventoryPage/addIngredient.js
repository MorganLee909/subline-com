window.addIngredientObj = {
    isPopulated: false,
    rows: [],

    display: function(){
        clearScreen();
        document.querySelector("#addIngredientAction").style.display = "flex";

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
                    let tbody = document.querySelector("#addIngredientAction tbody");

                    for(let ingredient of response.data){
                        let exists = false;
                        for(let merchIngredient of merchant.inventory){
                            if(ingredient._id === merchIngredient.ingredient._id){
                                exists = true;
                                break;
                            }
                        }

                        if(!exists){
                            let row = document.createElement("tr");
                            row._id = ingredient._id;
                            this.rows.push(row);
                            tbody.appendChild(row);

                            let checkbox = document.createElement("td");
                            row.appendChild(checkbox);

                            let checkboxInput = document.createElement("input");
                            checkboxInput.type = "checkbox";
                            checkbox.appendChild(checkboxInput);

                            let name = document.createElement("td");
                            name.innerText = ingredient.name;
                            row.appendChild(name);

                            let category = document.createElement("td");
                            category.innerText = ingredient.category;
                            row.appendChild(category);

                            let unit = document.createElement("td");
                            unit.innerText = ingredient.unit;
                            row.appendChild(unit);

                            let quantity = document.createElement("td");
                            row.appendChild(quantity);

                            let quantityInput = document.createElement("input");
                            quantityInput.type = "number";
                            quantityInput.step = "0.01";
                            quantityInput.min = "0";
                            quantity.appendChild(quantityInput);
                        }
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

        let addList = [];

        for(let row of this.rows){
            if(row.children[0].children[0].checked){
                let quantity = row.children[4].children[0].value;
                if(validator.ingredient.quantity(quantity)){
                    addList.append({
                        ingredient: row._id,
                        quantity: quantity
                    });
                }else{
                    break;
                }
            }
        }

        axios.post("/merchant/ingredients/create", addList)
            .then((response)=>{
                banner.createNotification("All ingredients successfully added");
                this.isPopulated = false;
                window.inventoryObj.display();
            })
            .catch((err)=>{
                banner.createError("Error: Something went wrong.  Try refreshing the page");
            });
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

                        for(let input of document.querySelectorAll("#createIngredientInput input")){
                            input.value = "";
                        }
                    }
                })
                .catch((err)=>{
                    banner.createError("Something went wrong and the ingredient could not be created");
                });
        }
    }
}