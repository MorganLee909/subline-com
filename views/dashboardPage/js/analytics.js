let analytics = {
    display: function(){
        const itemsList = document.getElementById("itemsList");

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("itemButton");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            itemsList.appendChild(li);
        }
    }
}

module.exports = analytics;