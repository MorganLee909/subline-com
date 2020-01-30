addIngredientsObj = {
    isPopulated: false,
    rows: [],
    displayedRows: [],
    currentSort: "",

    display: function(){
        controller.clearScreen();
        controller.addIngredientsStrand.style.display = "flex";

        if(!this.isPopulated){
            this.createRows();
            this.filter();
            this.isPopulated = true;
        }
    },

    createRows: function(){
        for(let ingredient of ingredients){
            let row = document.createElement("tr");
            row.id = ingredient._id;
            row.sortOptions = {
                name: ingredient.name.toLowerCase(),
                category: ingredient.category.toLowerCase(),
                unit: ingredient.unit.toLowerCase()
            };
        
            let add = document.createElement("td");
            row.appendChild(add);

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            add.appendChild(checkbox);
            
            let name = document.createElement("td");
            name.innerText = ingredient.name;
            name.classList = "truncateLong";
            row.appendChild(name);
        
            let category = document.createElement("td");
            category.innerText = ingredient.category;
            row.appendChild(category);
        
            let quantity = document.createElement("td");
            row.appendChild(quantity);

            let quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.step = "0.01";
            quantityInput.min = "0";
            quantityInput.classList = "inputField";
            quantity.appendChild(quantityInput);
            
            let unit = document.createElement("td");
            unit.innerText = ingredient.unit;
            row.appendChild(unit);

            this.rows.push(row);
        }
    },

    filter: function(){
        let searchString = document.querySelector("#filter").value.toLowerCase();

        this.displayedRows = [];

        for(let row of this.rows){
            if(row.sortOptions.name.includes(searchString)){
                this.displayedRows.push(row);
            }
        }

        this.currentSort = "";
        this.sortIngredients("name");
    },

    sortIngredients: function(property){
        if(this.currentSort === property){
            this.displayedRows.sort((a, b)=>(a.sortOptions[property] > b.sortOptions[property]) ? -1 : 1);
            this.currentSort = "";
        }else{
            this.displayedRows.sort((a, b)=>(a.sortOptions[property] > b.sortOptions[property]) ? 1 : -1);
            this.currentSort = property;
        }

        this.populate();
    },

    populate: function(){
        let tbody = document.querySelector("#addIngredientsStrand tbody");

        while(tbody.children.length > 0){
            tbody.removeChild(tbody.firstChild);
        }

        for(let row of this.displayedRows){
            tbody.appendChild(row);
        }
    },

    submit: function(){
        controller.data.inventory = [];

        let tbody = document.querySelector("#ingredient-display tbody");
        let isValid = true;
        for(let row of tbody.children){
            if(row.children[0].children[0].checked){
                let quantity = row.children[3].children[0].value;

                if(validator.ingredient.quantity(quantity)){
                    controller.data.inventory.push({
                        ingredient: {
                            id: row.id,
                            name: row.children[1].innerText,
                            category: row.children[2].innerText,
                            unit: row.children[4].innerText
                        },
                        quantity: quantity
                    });
                }else{
                    isValid = false;
                    break;
                }
            }
        }

        if(isValid){
            createIngredientsObj.display();
        }
    }
}