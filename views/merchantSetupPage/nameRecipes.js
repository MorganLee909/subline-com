let nameRecipesObj = {
    display: function(){
        controller.clearScreen();
        controller.nameRecipesStrand.style.display = "flex";

        this.addNameField();
    },

    //Add another input box to input another recipe name
    addNameField: function(){
        let nameList = document.querySelector("#nameList");

        let nameDiv = document.createElement("div");
        nameList.appendChild(nameDiv);

        let nameInput = document.createElement("input");
        nameInput.type = "text";
        nameDiv.appendChild(nameInput);

        let nameRemove = document.createElement("button");
        nameRemove.innerText = "Remove";
        nameRemove.classList = "button-small";
        nameRemove.onclick = ()=>{nameDiv.parentNode.removeChild(nameDiv)};
        nameDiv.appendChild(nameRemove);
    },

    submit: function(){
        controller.data.recipes = [];

        for(let nameDiv of document.querySelector("#nameList").children){
            controller.data.recipes.push({
                name: nameDiv.children[0].value,
                ingredients: []
            });
        }

        createRecipesObj.display();
    }
}