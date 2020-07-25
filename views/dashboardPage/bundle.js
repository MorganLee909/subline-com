(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    isPopulated: false,
    fakeMerchant: {},
    chosenIngredients: [],

    display: function(){
        let sidebar = document.querySelector("#addIngredients");

        if(!this.isPopulated){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/ingredients")
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < merchant.ingredients.length; i++){
                            for(let j = 0; j < response.length; j++){
                                if(merchant.ingredients[i].ingredient.id === response[j]._id){
                                    response.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        
                        for(let i = 0; i < response.length; i++){
                            response[i] = {ingredient: response[i]}
                        }
                        this.fakeMerchant = new Merchant({
                                name: "none",
                                inventory: response,
                                recipes: [],
                            },
                            []
                        );

                        this.populateAddIngredients();
                    }
                })
                .catch((err)=>{
                    banner.createError("UNABLE TO RETRIEVE DATA");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });

            this.isPopulated = true;
        }

        openSidebar(sidebar);
    },

    populateAddIngredients: function(){
        let addIngredientsDiv = document.getElementById("addIngredientList");
        let categoryTemplate = document.getElementById("addIngredientsCategory");
        let ingredientTemplate = document.getElementById("addIngredientsIngredient");

        let categories = this.fakeMerchant.categorizeIngredients();

        while(addIngredientsDiv.children.length > 0){
            addIngredientsDiv.removeChild(addIngredientsDiv.firstChild);
        }
        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.content.children[0].cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            categoryDiv.children[0].children[1].onclick = ()=>{addIngredientsComp.toggleAddIngredient(categoryDiv)};
            categoryDiv.children[1].style.display = "none";
            categoryDiv.children[0].children[1].children[1].style.display = "none";

            addIngredientsDiv.appendChild(categoryDiv);
            
            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredientDiv = ingredientTemplate.content.children[0].cloneNode(true);
                ingredientDiv.children[0].innerText = categories[i].ingredients[j].ingredient.name;
                ingredientDiv.children[2].onclick = ()=>{this.addOne(ingredientDiv)};
                ingredientDiv.ingredient = categories[i].ingredients[j].ingredient;

                categoryDiv.children[1].appendChild(ingredientDiv);
            }
        }

        let myIngredients = document.getElementById("myIngredients");
        while(myIngredients.children.length > 0){
            myIngredients.removeChild(myIngredients.firstChild);
        }
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

    addOne: function(element){
        element.parentElement.removeChild(element);
        document.getElementById("myIngredients").appendChild(element);
        document.getElementById("myIngredientsDiv").style.display = "flex";

        for(let i = 0; i < this.fakeMerchant.ingredients.length; i++){
            if(this.fakeMerchant.ingredients[i].ingredient === element.ingredient){
                this.fakeMerchant.ingredients.splice(i, 1);
                this.chosenIngredients.push(element.ingredient);
                break;
            }
        }

        let input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "0.01";
        input.placeholder = "QUANTITY";
        element.insertBefore(input, element.children[1]);

        let select = element.children[2];
        select.style.display = "block";
        let units = merchant.units[element.ingredient.unitType];
        for(let i = 0; i < units.length; i++){
            let option = document.createElement("option");
            option.innerText = units[i].toUpperCase();
            option.type = element.ingredient.unitType;
            option.value = units[i];
            select.appendChild(option);
        }

        element.children[3].innerText = "-";
        element.children[3].onclick = ()=>{this.removeOne(element)};
    },

    removeOne: function(element){
        element.parentElement.removeChild(element);

        element.removeChild(element.children[1]);

        let select = element.children[1];
        while(select.children.length > 0){
            select.removeChild(select.firstChild);
        }
        select.style.display = "none";

        element.children[2].innerText = "+";
        element.children[2].onclick = ()=>{this.addOne(element)};

        if(document.getElementById("myIngredients").children.length === 0){
            document.getElementById("myIngredientsDiv").style.display = "none";
        }

        for(let i = 0; i < this.chosenIngredients.length; i++){
            if(this.chosenIngredients[i] === element.ingredient){
                this.chosenIngredients.splice(i, 1);
                this.fakeMerchant.ingredients.push({
                    ingredient: element.ingredient
                });
                break;
            }
        }
        this.populateAddIngredients();
    },

    submit: function(){
        let ingredients = document.getElementById("myIngredients").children;
        let newIngredients = [];
        let fetchable = [];

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].value;
            let unit = ingredients[i].children[2].value;

            if(quantity === ""){
                banner.createError("PLEASE ENTER A QUANTITY FOR EACH INGREDIENT YOU WANT TO ADD TO YOUR INVENTORY");
                return;
            }
            quantity = convertToMain(unit, quantity);

            let newIngredient = {
                ingredient: ingredients[i].ingredient,
                quantity: quantity
            }
            newIngredient.ingredient.unit = unit;

            newIngredients.push(newIngredient);

            fetchable.push({
                id: ingredients[i].ingredient.id,
                quantity: quantity,
                defaultUnit: unit
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/merchant/ingredients/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(fetchable)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editIngredients(newIngredients);
                    this.isPopulated = false;
                    banner.createNotification("ALL INGREDIENTS ADDED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}
},{}],2:[function(require,module,exports){
const homeStrandObj = require("./home.js");
const ingredientsStrandObj = require("./ingredients.js");
const ordersStrandObj = require("./orders.js");
const recipeBookStrandObj = require("./recipeBook.js");
const transactions = require("./transactions.js");

const addIngredientsComp = require("./addIngredients.js");
const ingredientDetailsComp = require("./ingredientDetails.js");
const newIngredientComp = require("./newIngredient.js");
const newOrderComp = require("./newOrder.js");
const newRecipeComp = require("./newRecipe.js");
const newTransactionComp = require("./newTransaction.js");
const orderDetailsComp = require("./orderDetails.js");
const recipeDetailsComp = require("./recipeDetails.js");
const transactionDetailsComp = require("./transactionDetails.js");

class Ingredient{
    constructor(id, name, category, unitType, unit, parent){
        this.id = id;
        this.name = name;
        this.category = category;
        this.unitType = unitType;
        this.unit = unit;
        this.parent = parent;
    }

    convert(quantity){
        if(this.unitType === "mass"){
            switch(this.unit){
                case "g": break;
                case "kg": quantity /= 1000; break;
                case "oz":  quantity /= 28.3495; break;
                case "lb":  quantity /= 453.5924; break;
            }
        }else if(this.unitType === "volume"){
            switch(this.unit){
                case "ml": quantity *= 1000; break;
                case "l": break;
                case "tsp": quantity *= 202.8842; break;
                case "tbsp": quantity *= 67.6278; break;
                case "ozfl": quantity *= 33.8141; break;
                case "cup": quantity *= 4.1667; break;
                case "pt": quantity *= 2.1134; break;
                case "qt": quantity *= 1.0567; break;
                case "gal": quantity /= 3.7854; break;
            }
        }else if(this.unitType === "length"){
            switch(this.unit){
                case "mm": quantity *= 1000; break;
                case "cm": quantity *= 100; break;
                case "m": break;
                case "in": quantity *= 39.3701; break;
                case "ft": quantity *= 3.2808; break;
            }
        }

        return quantity;
    }
}

class Recipe{
    constructor(id, name, price, ingredients, parent){
        this.id = id;
        this.name = name;
        this.price = price;
        this.parent = parent;
        this.ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < parent.ingredients.length; j++){
                if(ingredients[i].ingredient === parent.ingredients[j].ingredient.id){
                    this.ingredients.push({
                        ingredient: parent.ingredients[j].ingredient,
                        quantity: ingredients[i].quantity
                    });
                    break;
                }
            }
        }
    }
}

class Transaction{
    constructor(id, date, recipes, parent){
        this.id = id;
        this.parent = parent;
        this.date = new Date(date);
        this.recipes = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < parent.recipes.length; j++){
                if(recipes[i].recipe === parent.recipes[j].id){
                    this.recipes.push({
                        recipe: parent.recipes[j],
                        quantity: recipes[i].quantity
                    });
                    break;
                }
            }
        }
    }
}

class Order{
    constructor(id, name, date, ingredients, parent){
        this.id = id;
        this.name = name;
        this.date = new Date(date);
        this.ingredients = [];
        this.parent = parent;

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < parent.ingredients.length; j++){
                if(ingredients[i].ingredient === parent.ingredients[j].ingredient.id){
                    this.ingredients.push({
                        ingredient: parent.ingredients[j].ingredient,
                        quantity: ingredients[i].quantity,
                        price: ingredients[i].price
                    });
                }
            }
        }
    }

    convertPrice(unitType, unit, price){
        if(unitType === "mass"){
            switch(unit){
                case "g": break;
                case "kg": price *= 1000; break;
                case "oz":  price *= 28.3495; break;
                case "lb":  price *= 453.5924; break;
            }
        }else if(unitType === "volume"){
            switch(unit){
                case "ml": price /= 1000; break;
                case "l": break;
                case "tsp": price /= 202.8842; break;
                case "tbsp": price /= 67.6278; break;
                case "ozfl": price /= 33.8141; break;
                case "cup": price /= 4.1667; break;
                case "pt": price /= 2.1134; break;
                case "qt": price /= 1.0567; break;
                case "gal": price *= 3.7854; break;
            }
        }else if(unitType === "length"){
            switch(unit){
                case "mm": price /= 1000; break;
                case "cm": price /= 100; break;
                case "m": break;
                case "in": price /= 39.3701; break;
                case "ft": price /= 3.2808; break;
            }
        }

        return price;
    }
}

class Merchant{
    constructor(oldMerchant, transactions){
        this.name = oldMerchant.name;
        this.pos = oldMerchant.pos;
        this.ingredients = [];
        this.recipes = [];
        this.transactions = [];
        this.orders = [];
        this.units = {
            mass: ["g", "kg", "oz", "lb"],
            volume: ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"],
            length: ["mm", "cm", "m", "in", "foot"]
        }
        
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            this.ingredients.push({
                ingredient: new Ingredient(
                    oldMerchant.inventory[i].ingredient._id,
                    oldMerchant.inventory[i].ingredient.name,
                    oldMerchant.inventory[i].ingredient.category,
                    oldMerchant.inventory[i].ingredient.unitType,
                    oldMerchant.inventory[i].defaultUnit,
                    this
                ),
                quantity: oldMerchant.inventory[i].quantity
            });
        }

        for(let i = 0; i < oldMerchant.recipes.length; i++){
            this.recipes.push(new Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                oldMerchant.recipes[i].ingredients,
                this
            ));
        }

        for(let i = 0; i < transactions.length; i++){
            this.transactions.push(new Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            ));
        }
    }

    /*
    Updates all specified item in the merchant's inventory and updates the page
    If ingredient doesn't exist, add it
    ingredients = {
        ingredient: Ingredient object,
        quantity: new quantity,
        defaultUnit: the default unit to be displayed
    }
    remove = set true if removing
    isOrder = set true if this is coming from an order
    */
    editIngredients(ingredients, remove = false, isOrder = false){
        for(let i = 0; i < ingredients.length; i++){
            let isNew = true;
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient === ingredients[i].ingredient){
                    if(remove){
                        merchant.ingredients.splice(j, 1);
                    }else if(!remove && isOrder){
                        merchant.ingredients[j].quantity += ingredients[i].quantity;
                    }else{
                        merchant.ingredients[j].quantity = ingredients[i].quantity;
                    }
    
                    isNew = false;
                    break;
                }
            }
    
            if(isNew){
                merchant.ingredients.push({
                    ingredient: ingredients[i].ingredient,
                    quantity: parseFloat(ingredients[i].quantity),
                    defaultUnit: ingredients[i].defaultUnit
                });
            }
        }
    
        homeStrandObj.drawInventoryCheckCard();
        ingredientsStrandObj.populateByProperty("category");
        addIngredientsComp.isPopulated = false;
        closeSidebar();
    }

    /*
    Updates a recipe in the merchants list of recipes
    Can create, edit or remove
    recipe = [Recipe object]
    remove = will remove recipe when true
    */
    editRecipes(recipes, remove = false){
        let isNew = true;

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < this.recipes.length; j++){
                if(recipes[i] === this.recipes[j]){
                    if(remove){
                        this.recipes.splice(j, 1);
                    }else{
                        this.recipes[j] = recipes[i];
                    }

                    isNew = false;
                    break;
                }
            }

            if(isNew){
                merchant.recipes.push(recipes[i]);
            }
        }

        transactionsStrandObj.isPopulated = false;
        recipeBookStrandObj.populateRecipes();
        closeSidebar();
    }

    /*
    Updates a list of orders in the merchants list of orders
    Create/edit/remove
    orders = [Order object]
    remove = will remove order when true
    */
    editOrders(orders, remove = false){
        for(let i = 0; i < orders.length; i++){
            let isNew = true;
            for(let j = 0; j < this.orders.length; j++){
                if(orders[i] === this.orders[j]){
                    if(remove){
                        this.orders.splice(j, 1);
                    }else{
                        this.orders[j] = orders[i];
                    }

                    isNew = false;
                    break;
                }
            }

            if(isNew){
                this.orders.push(orders[i]);
            }
        }

        ordersStrandObj.populate();
        closeSidebar();
    }

    editTransactions(transaction, remove = false){
        let isNew = true;
        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i] === transaction){
                if(remove){
                    this.transactions.splice(i, 1);
                }

                isNew = false;
                break;
            }
        }

        if(isNew){
            this.transactions.push(transaction);
            this.transactions.sort((a, b) => a.date > b.date ? 1 : -1);
        }

        transactionsStrandObj.isPopulated = false;
        transactionsStrandObj.display();
        closeSidebar();
    }

    /*
    Gets the indices of two dates from transactions
    Inputs
    from: starting date
    to: ending date (default to now)
    Output
    Array containing starting index and ending index
    Note: Will return false if it cannot find both necessary dates
    */
    transactionIndices(from, to = new Date()){
        let indices = [];

        for(let i = 0; i < this.transactions.length; i++){
            if(this.transactions[i].date > from){
                indices.push(i);
                break;
            }
        }

        for(let i = this.transactions.length - 1; i >=0; i--){
            if(this.transactions[i].date < to){
                indices.push(i);
                break;
            }
        }

        if(indices.length < 2){
            return false;
        }

        return indices;
    }

    revenue(indices){
        let total = 0;

        for(let i = indices[0]; i <= indices[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === this.recipes[k]){
                        total += this.transactions[i].recipes[j].quantity * this.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    }

    /*
    Gets the quantity of each ingredient sold between two dates (dateRange)
    Inputs
    dateRange: list containing a start date and an end date
    Return:
        [{
            ingredient: Ingredient object,
            quantity: quantity of ingredient sold
        }]
    */
    ingredientsSold(dateRange){
        if(!dateRange){
            return false;
        }
        
        let recipes = this.recipesSold(dateRange);
        let ingredientList = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < recipes[i].recipe.ingredients.length; j++){
                let exists = false;

                for(let k = 0; k < ingredientList.length; k++){
                    if(ingredientList[k].ingredient === recipes[i].recipe.ingredients[j].ingredient){
                        exists = true;
                        ingredientList[k].quantity += recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        ingredient: recipes[i].recipe.ingredients[j].ingredient,
                        quantity: recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity
                    });
                }
            }
        }
    
        return ingredientList;
    }

    singleIngredientSold(dateRange, ingredient){
        let total = 0;

        for(let i = dateRange[0]; i < dateRange[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < this.transactions[i].recipes[j].recipe.ingredients.length; k++){
                    if(this.transactions[i].recipes[j].recipe.ingredients[k].ingredient === ingredient.ingredient){
                        total += this.transactions[i].recipes[j].recipe.ingredients[k].quantity;
                        break;
                    }
                }
            }
        }

        return total;
    }

    /*
    Gets the number of recipes sold between two dates (dateRange)
    Inputs:
        dateRange: array containing a start date and an end date
    Return:
        [{
            recipe: a recipe object
            quantity: quantity of the recipe sold
        }]
    */
    recipesSold(dateRange){
        let recipeList = [];

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                let exists = false;
                for(let k = 0; k < recipeList.length; k++){
                    if(recipeList[k].recipe === this.transactions[i].recipes[j].recipe){
                        exists = true;
                        recipeList[k].quantity += this.transactions[i].recipes[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        recipe: this.transactions[i].recipes[j].recipe,
                        quantity: this.transactions[i].recipes[j].quantity
                    });
                }
            }
        }

        return recipeList;
    }

    /*
    Create revenue data for graphing
    Input:
        dateRange: [start index, end index] (this.transactionIndices)
    Return:
        [total revenue for each day]
    */
    graphDailyRevenue(dateRange){
        if(!dateRange){
            return false;
        }

        let dataList = new Array(30).fill(0);
        let currentDate = this.transactions[dateRange[0]].date;
        let arrayIndex = 0;

        for(let i = dateRange[0]; i <= dateRange[1]; i++){
            if(this.transactions[i].date.getDate() !== currentDate.getDate()){
                currentDate = this.transactions[i].date;
                arrayIndex++;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                dataList[arrayIndex] += (this.transactions[i].recipes[j].recipe.price / 100) * this.transactions[i].recipes[j].quantity;
            }
        }

        return dataList;
    }
    
    /*
    Groups all of the merchant's ingredients by their category
    Return: [{
        name: category name,
        ingredients: [Ingredient Object]
    }]
    */
    categorizeIngredients(){
        let ingredientsByCategory = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this.ingredients[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this.ingredients[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this.ingredients[i].ingredient.category,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    unitizeIngredients(){
        let ingredientsByUnit = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let unitExists = false;
            for(let j = 0; j < ingredientsByUnit.length; j++){
                if(this.ingredients[i].ingredient.unit === ingredientsByUnit[j].name){
                    ingredientsByUnit[j].ingredients.push(this.ingredients[i]);

                    unitExists = true;
                    break;
                }
            }

            if(!unitExists){
                ingredientsByUnit.push({
                    name: this.ingredients[i].ingredient.unit,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByUnit;
    }

    getRecipesForIngredient(ingredient){
        let recipes = [];

        for(let i = 0; i < this.recipes.length; i++){
            for(let j = 0; j < this.recipes[i].ingredients.length; j++){
                if(this.recipes[i].ingredients[j].ingredient === ingredient){
                    recipes.push(this.recipes[i]);
                }
            }
        }

        return recipes;
    }
}

let convertToMain = (unit, quantity)=>{
    let converted = 0;

    if(merchant.units.mass.includes(unit)){
        switch(unit){
            case "g": converted = quantity; break;
            case "kg": converted = quantity * 1000; break;
            case "oz": converted = quantity * 28.3495; break;
            case "lb": converted = quantity * 453.5924; break;
        }
    }else if(merchant.units.volume.includes(unit)){
        switch(unit){
            case "ml": converted = quantity / 1000; break;
            case "l": converted = quantity; break;
            case "tsp": converted = quantity / 202.8842; break;
            case "tbsp": converted = quantity / 67.6278; break;
            case "ozfl": converted = quantity / 33.8141; break;
            case "cup": converted = quantity / 4.1667; break;
            case "pt": converted = quantity / 2.1134; break;
            case "qt": converted = quantity / 1.0567; break;
            case "gal": converted = quantity * 3.7854; break;
        }
    }else if(merchant.units.length.includes(unit)){
        switch(unit){
            case "mm": converted = quantity / 1000; break;
            case "cm": converted = quantity / 100; break;
            case "m": converted = quantity; break;
            case "in": converted = quantity / 39.3701; break;
            case "ft": converted = quantity / 3.2808; break;
        }
    }else{
        converted = quantity;
    }

    return converted;
}

/* 
Switches to a different strand
Input:
 name: name of the strand.  Must end with "Strand"
*/
let changeStrand = (name)=>{
    closeSidebar();

    for(let strand of document.querySelectorAll(".strand")){
        strand.style.display = "none";
    }

    let buttons = document.querySelectorAll(".menuButton");
    for(let i = 0; i < buttons.length - 1; i++){
        buttons[i].classList = "menuButton";
        buttons[i].onclick = ()=>{changeStrand(`${buttons[i].id.slice(0, buttons[i].id.indexOf("Btn"))}Strand`)};
    }

    let activeButton = document.querySelector(`#${name.slice(0, name.indexOf("Strand"))}Btn`);
    activeButton.classList = "menuButton active";
    activeButton.onclick = undefined;

    document.querySelector(`#${name}`).style.display = "flex";
    window[`${name}Obj`].display();

    if(window.screen.availWidth <= 1000){
        closeMenu();
    }
}

//Close any open sidebar
let closeSidebar = ()=>{
    let sidebar = document.querySelector("#sidebarDiv");
    for(let i = 0; i < sidebar.children.length; i++){
        sidebar.children[i].style.display = "none";
    }
    sidebar.classList = "sidebarHide";

    if(window.screen.availWidth <= 1000){
        document.querySelector(".contentBlock").style.display = "flex";
        document.getElementById("mobileMenuSelector").style.display = "block";
        document.getElementById("sidebarCloser").style.display = "none";
    }
    
}

/*
Open a specific sidebar
Input:
 sidebar: the outermost element of the sidebar (must contain class sidebar)
*/
let openSidebar = (sidebar)=>{
    document.querySelector("#sidebarDiv").classList = "sidebar";

    let sideBars = document.querySelector("#sidebarDiv").children;
    for(let i = 0; i < sideBars.length; i++){
        sideBars[i].style.display = "none";
    }

    sidebar.style.display = "flex";

    if(window.screen.availWidth <= 1000){
        document.querySelector(".contentBlock").style.display = "none";
        document.getElementById("mobileMenuSelector").style.display = "none";
        document.getElementById("sidebarCloser").style.display = "block";
    }
}

let changeMenu = ()=>{
    let menu = document.querySelector(".menu");
    let buttons = document.querySelectorAll(".menuButton");
    if(!menu.classList.contains("menuMinimized")){
        menu.classList = "menu menuMinimized";

        for(let button of buttons){
            button.children[1].style.display = "none";
        }

        document.querySelector("#max").style.display = "none";
        document.querySelector("#min").style.display = "flex";

        
    }else if(menu.classList.contains("menuMinimized")){
        menu.classList = "menu";

        for(let button of buttons){
            button.children[1].style.display = "block";
        }

        setTimeout(()=>{
            document.querySelector("#max").style.display = "flex";
            document.querySelector("#min").style.display = "none";
        }, 150);
    }
}

let openMenu = ()=>{
    document.getElementById("menu").style.display = "flex";
    document.querySelector(".contentBlock").style.display = "none";
    document.getElementById("mobileMenuSelector").onclick = ()=>{closeMenu()};
}

let closeMenu = ()=>{
    document.getElementById("menu").style.display = "none";
    document.querySelector(".contentBlock").style.display = "flex";
    document.getElementById("mobileMenuSelector").onclick = ()=>{openMenu()};
}

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}

let merchant = new Merchant(data.merchant, data.transactions);
console.log(merchant);
module.exports = merchant;
homeStrandObj.display();
},{"./addIngredients.js":1,"./home.js":3,"./ingredientDetails.js":4,"./ingredients.js":5,"./newIngredient.js":6,"./newOrder.js":7,"./newRecipe.js":8,"./newTransaction.js":9,"./orderDetails.js":10,"./orders.js":11,"./recipeBook.js":12,"./recipeDetails.js":13,"./transactionDetails.js":14,"./transactions.js":15}],3:[function(require,module,exports){
let merchant = require("./dashboard.js");

module.exports = {
    isPopulated: false,
    graph: {},

    display: function(){
        if(!this.isPopulated){
            this.drawRevenueCard();
            this.drawRevenueGraph();
            this.drawInventoryCheckCard();
            this.drawPopularCard();

            this.isPopulated = true;
        }
    },

    drawRevenueCard: function(){
        let today = new Date();
        let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let lastMonthtoDay = new Date(new Date().setMonth(today.getMonth() - 1));

        console.log(merchant);
        let revenueThisMonth = merchant.revenue(merchant.transactionIndices(firstOfMonth));
        let revenueLastmonthToDay = merchant.revenue(merchant.transactionIndices(firstOfLastMonth, lastMonthtoDay));

        document.querySelector("#revenue").innerText = `$${revenueThisMonth.toLocaleString("en")}`;

        let revenueChange = ((revenueThisMonth - revenueLastmonthToDay) / revenueLastmonthToDay) * 100;
        
        let img = "";
        if(revenueChange >= 0){
            img = "/shared/images/upArrow.png";
        }else{
            img = "/shared/images/downArrow.png";
        }
        document.querySelector("#revenueChange p").innerText = `${Math.abs(revenueChange).toFixed(2)}% vs last month`;
        document.querySelector("#revenueChange img").src = img;
    },

    drawRevenueGraph: function(){
        let graphCanvas = document.querySelector("#graphCanvas");
        let today = new Date();

        graphCanvas.height = graphCanvas.parentElement.clientHeight;
        graphCanvas.width = graphCanvas.parentElement.clientWidth;

        this.graph = new LineGraph(graphCanvas);
        this.graph.addTitle("Revenue");

        let thirtyAgo = new Date(today);
        thirtyAgo.setDate(today.getDate() - 29);

        let data = merchant.graphDailyRevenue(merchant.transactionIndices(thirtyAgo));
        if(data){
            this.graph.addData(
                data,
                [thirtyAgo, new Date()],
                "Revenue"
            );
        }else{
            document.querySelector("#graphCanvas").style.display = "none";
            
            let notice = document.createElement("h1");
            notice.innerText = "NO DATA YET";
            notice.classList = "notice";
            document.querySelector("#graphCard").appendChild(notice);
        }
    },

    drawInventoryCheckCard: function(){
        let num;
        if(merchant.ingredients.length < 5){
            num = merchant.ingredients.length;
        }else{
            num = 5;
        }
        let rands = [];
        for(let i = 0; i < num; i++){
            let rand = Math.floor(Math.random() * merchant.ingredients.length);

            if(rands.includes(rand)){
                i--;
            }else{
                rands[i] = rand;
            }
        }

        let ul = document.querySelector("#inventoryCheckCard ul");
        let template = document.querySelector("#ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];

            ingredientCheck.ingredient = merchant.ingredients[rands[i]];
            ingredientCheck.children[0].innerText = merchant.ingredients[rands[i]].ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{input.value--};
            input.value = merchant.ingredients[rands[i]].quantity.toFixed(2);
            ingredientCheck.children[1].children[2].onclick = ()=>{input.value++}
            ingredientCheck.children[2].innerText = merchant.ingredients[rands[i]].ingredient.unit.toUpperCase();

            ul.appendChild(ingredientCheck);
        }
    },

    drawPopularCard: function(){
        let dataArray = [];
        let now = new Date();
        let thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let ingredientList = merchant.ingredientsSold(merchant.transactionIndices(thisMonth));
        if(ingredientList !== false){
            window.ingredientList = [...ingredientList];
            let iterations = (ingredientList.length < 5) ? ingredientList.length : 5;
            for(let i = 0; i < iterations; i++){
                try{
                    let max = ingredientList[0].quantity;
                    let index = 0;
                    for(let j = 0; j < ingredientList.length; j++){
                        if(ingredientList[j].quantity > max){
                            max = ingredientList[j].quantity;
                            index = j;
                        }
                    }

                    dataArray.push({
                        num: max,
                        label: ingredientList[index].ingredient.name + ": " +
                        ingredientList[index].ingredient.convert(ingredientList[index].quantity).toFixed(2) +
                        " " + ingredientList[index].ingredient.unit
                    });
                    ingredientList.splice(index, 1);
                }catch(err){
                    break;
                }
            }

            let thisCanvas = document.getElementById("popularCanvas");
            thisCanvas.width = thisCanvas.parentElement.offsetWidth * 0.8;
            thisCanvas.height = thisCanvas.parentElement.offsetHeight * 0.8;

            let popularGraph = new HorizontalBarGraph(thisCanvas);
            popularGraph.addData(dataArray);
        }else{
            document.querySelector("#popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.querySelector("#popularIngredientsCard").appendChild(notice);
        }
    },

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = lis[i].ingredient;

                let value = parseFloat(lis[i].children[1].children[1].value);

                if(value !== merchIngredient.quantity){
                    changes.push({
                        id: merchIngredient.ingredient.id,
                        ingredient: merchIngredient.ingredient,
                        quantity: value
                    });
                }
            }else{
                banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");
                return;
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        
        if(changes.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(changes)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        merchant.editIngredients(changes);
                        banner.createNotification("INGREDIENTS UPDATED");
                    }
                })
                .catch((err)=>{})
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}
},{"./dashboard.js":2}],4:[function(require,module,exports){
module.exports = {
    ingredient: {},

    display: function(ingredient){
        this.ingredient = ingredient;

        sidebar = document.querySelector("#ingredientDetails");

        document.querySelector("#ingredientDetails p").innerText = ingredient.ingredient.category;
        document.querySelector("#ingredientDetails h1").innerText = ingredient.ingredient.name;
        let ingredientStock = document.getElementById("ingredientStock");
        ingredientStock.innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        ingredientStock.style.display = "block";
        let ingredientInput = document.getElementById("ingredientInput");
        ingredientInput.value = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);
        ingredientInput.style.display = "none";

        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            let indices = merchant.transactionIndices(startDay, endDay);

            if(indices === false){
                quantities.push(0);
            }else{
                quantities.push(merchant.singleIngredientSold(indices, ingredient));
            }
        }

        let sum = 0;
        for(let quantity of quantities){
            sum += quantity;
        }

        document.querySelector("#dailyUse").innerText = `${(sum/quantities.length).toFixed(2)} ${ingredient.ingredient.unit}`;

        let ul = document.querySelector("#ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                changeStrand("recipeBookStrand");
                recipeDetailsComp.display(recipes[i]);
            }
            ul.appendChild(li);
        }

        let ingredientButtons = document.getElementById("ingredientButtons");
        let units = [];
        let unitLabel = document.getElementById("displayUnitLabel");
        let defaultButton = document.getElementById("defaultUnit");
        if(this.ingredient.ingredient.unitType !== "other"){
            units = merchant.units[this.ingredient.ingredient.unitType];
            unitLabel.style.display = "block";
            defaultButton.style.display = "block";
        }else{
            unitLabel.style.display = "none";
            defaultButton.style.display = "none";
        }
        
        while(ingredientButtons.children.length > 0){
            ingredientButtons.removeChild(ingredientButtons.firstChild);
        }
        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button, units[i])};
            ingredientButtons.appendChild(button);

            if(units[i] === this.ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }

        openSidebar(sidebar);
    },

    remove: function(){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(this.ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/merchant/ingredients/remove/${this.ingredient.ingredient.id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT REMOVED");
                    merchant.editIngredients([this.ingredient], true);
                }
            })
            .catch((err)=>{})
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    edit: function(){
        document.getElementById("ingredientStock").style.display = "none";
        document.getElementById("ingredientInput").style.display = "block";
        document.getElementById("editSubmitButton").style.display = "block";
    },

    editSubmit: function(){
        this.ingredient.quantity = Number(document.getElementById("ingredientInput").value);
        let data = [{
            id: this.ingredient.ingredient.id,
            quantity: this.ingredient.quantity
        }];

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        if(validator.ingredientQuantity(data[0].quantity)){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        merchant.editIngredients([this.ingredient]);
                        banner.createNotification("INGREDIENT UPDATED");
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    },

    changeUnit: function(newActive, unit){
        this.ingredient.ingredient.unit = unit;

        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            ingredientButtons[i].classList.remove("unitActive");
        }

        newActive.classList.add("unitActive");

        homeStrandObj.isPopulated = false;
        ingredientsStrandObj.populateByProperty("category");
        document.getElementById("ingredientStock").innerText = `${this.ingredient.ingredient.convert(this.ingredient.quantity).toFixed(2)} ${this.ingredient.ingredient.unit.toUpperCase()}`;
    },

    changeUnitDefault: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        let id = this.ingredient.ingredient.id;
        let unit = this.ingredient.ingredient.unit;
        fetch(`/merchant/ingredients/update/${id}/${unit}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    banner.createNotification("INGREDIENT DEFAULT UNIT UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}
},{}],5:[function(require,module,exports){
module.exports = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            this.populateByProperty("category");

            this.isPopulated = true;
        }
    },

    populateByProperty: function(property){
        let categories;
        if(property === "category"){
            categories = merchant.categorizeIngredients();
        }else if(property === "unit"){
            categories = merchant.unitizeIngredients();
        }
        
        let ingredientStrand = document.querySelector("#categoryList");
        let categoryTemplate = document.querySelector("#categoryDiv").content.children[0];
        let ingredientTemplate = document.querySelector("#ingredient").content.children[0];
        this.ingredients = [];

        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            categoryDiv.children[0].children[1].onclick = ()=>{this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1])};
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.ingredient.name;
                ingredientDiv.children[2].innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
                ingredientDiv.onclick = ()=>{ingredientDetailsComp.display(ingredient)};
                ingredientDiv._name = ingredient.ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.ingredient.unit.toLowerCase();

                categoryDiv.children[1].appendChild(ingredientDiv);
                this.ingredients.push(ingredientDiv);
            }
        }

    },

    displayIngredientsOnly: function(ingredients){
        let ingredientDiv = document.querySelector("#categoryList");

        while(ingredientDiv.children.length > 0){
            ingredientDiv.removeChild(ingredientDiv.firstChild);
        }
        for(let i = 0; i < ingredients.length; i++){
            ingredientDiv.appendChild(ingredients[i]);
        }
    },

    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    },

    search: function(){
        let input = document.querySelector("#ingredientSearch").value.toLowerCase();
        document.querySelector("#ingredientSelect").selectedIndex = 0;

        if(input === ""){
            this.populateByProperty("category");
            document.querySelector("#ingredientClearButton").style.display = "none";
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        document.querySelector("#ingredientClearButton").style.display = "inline";
        this.displayIngredientsOnly(matchingIngredients);
    },

    sort: function(sortType){
        if(sortType === ""){
            return;
        }

        document.querySelector("#ingredientSearch").value = "";

        if(sortType === "category"){
            this.populateByProperty("category");
            return;
        }

        if(sortType === "unit"){
            this.populateByProperty("unit");
            return;
        }

        document.querySelector("#ingredientClearButton").style.display = "inline";
        let sortedIngredients = this.ingredients.slice().sort((a, b)=> (a[sortType] > b[sortType]) ? 1 : -1);
        this.displayIngredientsOnly(sortedIngredients);
    },

    clearSorting: function(button){
        document.querySelector("#ingredientSearch").value = "";
        document.querySelector("#ingredientSelect").selectedIndex = 0;
        document.querySelector("#ingredientClearButton").style.display = "none";

        this.populateByProperty("category");
    }
}
},{}],6:[function(require,module,exports){
module.exports = {
    display: function(){
        openSidebar(document.querySelector("#newIngredient"));

        document.querySelector("#newIngName").value = "";
        document.querySelector("#newIngCategory").value = "";
        document.querySelector("#newIngQuantity").value = 0;
    },

    submit: function(){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type"),
            },
            quantity: convertToMain(unit, document.querySelector("#newIngQuantity").value),
            defaultUnit: unit
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newIngredient)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editIngredients([{
                        ingredient: new Ingredient(
                            response.ingredient._id,
                            response.ingredient.name,
                            response.ingredient.category,
                            response.ingredient.unitType,
                            response.defaultUnit,
                            merchant
                        ),
                        quantity: response.quantity
                    }]);

                    banner.createNotification("INGREDIENT CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}
},{}],7:[function(require,module,exports){
module.exports = {
    isPopulated: false,
    unused: [],

    display: function(){
        if(!this.isPopulated){
            let categories = merchant.categorizeIngredients();
            let categoriesList = document.querySelector("#newOrderCategories");
            let template = document.querySelector("#addIngredientsCategory").content.children[0];
            let ingredientTemplate = document.querySelector("#addIngredientsIngredient").content.children[0];
    
            for(let i = 0; i < categories.length; i++){
                let category = template.cloneNode(true);
    
                category.children[0].children[0].innerText = categories[i].name;
                category.children[0].children[1].onclick = ()=>{addIngredientsComp.toggleAddIngredient(category)};
                category.children[0].children[1].children[1].style.display = "none";
                category.children[1].style.display = "none";
                
                categoriesList.appendChild(category);
    
                for(let j = 0; j < categories[i].ingredients.length; j++){
                    let ingredientDiv = ingredientTemplate.cloneNode(true);
    
                    ingredientDiv.children[0].innerText = categories[i].ingredients[j].ingredient.name;
                    ingredientDiv.children[2].onclick = ()=>{this.addOne(ingredientDiv, category.children[1])};
                    ingredientDiv.ingredient = categories[i].ingredients[j].ingredient;
    
                    this.unused.push(categories[i].ingredients[j]);
                    category.children[1].appendChild(ingredientDiv);
                }
            }

            this.isPopulated = true;
        }

        openSidebar(document.querySelector("#newOrder"));
    },

    addOne: function(ingredientDiv, container){
        for(let i = 0; i < this.unused.length; i++){
            if(this.unused[i] === ingredientDiv){
                this.unused.splice(i, 1);
                break;
            }
        }

        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.placeholder = `QUANTITY (${ingredientDiv.ingredient.unit})`;
        quantityInput.min = "0";
        quantityInput.step = "0.01";
        ingredientDiv.insertBefore(quantityInput, ingredientDiv.children[1]);

        let priceInput = document.createElement("input");
        priceInput.type = "number";
        priceInput.placeholder = "Price Per Unit";
        priceInput.min = "0";
        priceInput.step = "0.01";
        ingredientDiv.insertBefore(priceInput, ingredientDiv.children[2]);

        ingredientDiv.children[4].innerText = "-";
        ingredientDiv.children[4].onclick = ()=>{this.removeOne(ingredientDiv, container)};

        container.removeChild(ingredientDiv);
        document.getElementById("newOrderAdded").appendChild(ingredientDiv);
    },

    removeOne: function(ingredientDiv, container){
        this.unused.push(ingredientDiv.ingredient);

        ingredientDiv.removeChild(ingredientDiv.children[1]);
        ingredientDiv.removeChild(ingredientDiv.children[1]);
        ingredientDiv.children[1].innerText = "+";
        ingredientDiv.children[1].onclick = ()=>{this.addOne(ingredientDiv, container)};
        
        ingredientDiv.parentElement.removeChild(ingredientDiv);
        container.appendChild(ingredientDiv);
    },

    submit: function(){
        let categoriesList = document.getElementById("newOrderAdded");
        let ingredients = [];

        for(let i = 0; i < categoriesList.children.length; i++){
            let quantity = categoriesList.children[i].children[1].value;
            let price = categoriesList.children[i].children[2].value;

            let fakeOrder = new Order(undefined, undefined, new Date(), [], undefined);
            if(quantity !== ""  && price !== ""){
                ingredients.push({
                    ingredient: categoriesList.children[i].ingredient.id,
                    quantity: convertToMain(categoriesList.children[i].ingredient.unit, parseFloat(quantity)),
                    price: categoriesList.children[i].ingredient.convert(parseInt(price * 100))
                });
            }
        }

        let date = `${document.getElementById("orderDate").value}T${document.getElementById("orderTime").value}:00`

        let data = {
            name: document.getElementById("orderName").value,
            date: date,
            ingredients: ingredients
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        
        fetch("/order/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let order = new Order(
                       response._id,
                       response.name,
                       response.date,
                       response.ingredients,
                       merchant 
                    )

                    merchant.editOrders([order]);
                    merchant.editIngredients(order.ingredients, false, true);
                    banner.createNotification("ORDER CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOEMTHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}
},{}],8:[function(require,module,exports){
module.exports = {
    display: function(){
        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = merchant.categorizeIngredients();

        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        for(let category of categories){
            let optgroup = document.createElement("optgroup");
            optgroup.label = category.name;
            ingredientsSelect.appendChild(optgroup);

            for(let ingredient of category.ingredients){
                let option = document.createElement("option");
                option.value = ingredient.ingredient.id;
                option.innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit})`;
                optgroup.appendChild(option);
            }
        }

        openSidebar(document.querySelector("#addRecipe"));
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.querySelector("#ingredientCount").value;
        let ingredientsDiv = document.querySelector("#recipeInputIngredients");
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = ingredientsDiv.children[0].cloneNode(true);
                newNode.children[2].children[0].value = "";

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `INGREDIENT ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(){
        let newRecipe = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.querySelectorAll("#recipeInputIngredients > div");
        for(let i = 0; i < inputs.length; i++){
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === inputs[i].children[1].children[0].value){
                    newRecipe.ingredients.push({
                        ingredient: inputs[i].children[1].children[0].value,
                        quantity: convertToMain(merchant.ingredients[j].ingredient.unit, inputs[i].children[2].children[0].value)
                    });

                    break;
                }
            }
        }

        if(!validator.recipe(newRecipe)){
            return;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let recipe = new Recipe(
                        response._id,
                        response.name,
                        response.price,
                        response.ingredients,
                        merchant,
                    );
                    
                    merchant.editRecipes([recipe]);
                    banner.createNotification("RECIPE CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}
},{}],9:[function(require,module,exports){
module.exports = {
    display: function(){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        openSidebar(document.getElementById("newTransaction"));
    },

    submit: function(){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
        let newTransaction = {
            date: date,
            recipes: []
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            if(quantity !== "" && quantity > 0){
                newTransaction.recipes.push({
                    recipe: recipeDivs.children[i].recipe.id,
                    quantity: quantity
                });
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
                return;
            }
        }

        if(newTransaction.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
                method: "post",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(newTransaction)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        let transaction = new Transaction(
                            response._id,
                            response.date,
                            response.recipes,
                            merchant
                        );
                        merchant.editTransactions(transaction);
                        banner.createNotification("NEW TRANSACTION CREATED");
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}
},{}],10:[function(require,module,exports){
module.exports = {
    display: function(order){
        openSidebar(document.querySelector("#orderDetails"));

        document.querySelector("#removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTime").innerText = order.date.toLocaleTimeString("en-US");

        let ingredientList = document.querySelector("#orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#orderIngredient").content.children[0];
        let grandTotal = 0;
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            let price = (order.ingredients[i].quantity * order.ingredients[i].price) / 100;
            grandTotal += price;

            let ingredient = order.ingredients[i].ingredient;
            let priceText = ingredient.convert(order.ingredients[i].quantity).toFixed(2) + " " + 
                ingredient.unit.toUpperCase() + " x $" +
                (order.convertPrice(ingredient.unitType, ingredient.unit, order.ingredients[i].price) / 100).toFixed(2);
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[1].innerText = priceText;
            ingredientDiv.children[2].innerText = `$${price.toFixed(2)}`;

            ingredientList.appendChild(ingredientDiv);
        }

        document.querySelector("#orderTotalPrice p").innerText = `$${grandTotal.toFixed(2)}`;
    },

    remove: function(order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/order/${order.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editOrders([order], true);
                    banner.createNotification("ORDER REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}
},{}],11:[function(require,module,exports){
module.exports = {
    isFetched: false,

    display: async function(){
        if(!this.isFetched){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/order", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            })
                .then((response) => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        let newOrders = [];
                        for(let i = 0; i < response.length; i++){
                            newOrders.push(new Order(
                                response[i]._id,
                                response[i].name,
                                response[i].date,
                                response[i].ingredients,
                                merchant
                            ));
                        }
                        merchant.editOrders(newOrders);

                        this.isFetched = true;
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. TRY REFRESHING THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    },

    populate: function(){
        let listDiv = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];
        let dateDropdown = document.getElementById("dateDropdownOrder");
        let ingredientDropdown = document.getElementById("ingredientDropdown");

        dateDropdown.style.display = "none";
        ingredientDropdown.style.display = "none";

        document.getElementById("dateFilterBtnOrder").onclick = ()=>{this.toggleDropdown(dateDropdown)};
        document.getElementById("ingredientFilterBtn").onclick = ()=>{this.toggleDropdown(ingredientDropdown)};

        for(let i = 0; i < merchant.ingredients.length; i++){
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.ingredient = merchant.ingredients[i].ingredient;
            ingredientDropdown.appendChild(checkbox);

            let label = document.createElement("label");
            label.innerText = merchant.ingredients[i].ingredient.name;
            label.for = checkbox;
            ingredientDropdown.appendChild(label);

            let brk = document.createElement("br");
            ingredientDropdown.appendChild(brk);
        }

        while(listDiv.children.length > 0){
            listDiv.removeChild(listDiv.firstChild);
        }

        for(let i = 0; i < merchant.orders.length; i++){
            let row = template.cloneNode(true);
            let totalCost = 0;
            
            for(let j = 0; j < merchant.orders[i].ingredients.length; j++){
                totalCost += merchant.orders[i].ingredients[j].quantity * merchant.orders[i].ingredients[j].price;
            }

            row.children[0].innerText = merchant.orders[i].name;
            row.children[1].innerText = `${merchant.orders[i].ingredients.length} items`;
            row.children[2].innerText = new Date(merchant.orders[i].date).toLocaleDateString("en-US");
            row.children[3].innerText = `$${(totalCost / 100).toFixed(2)}`;
            row.order = merchant.orders[i];
            row.onclick = ()=>{orderDetailsComp.display(merchant.orders[i])};

            listDiv.appendChild(row);
        }
    },

    submitFilter: function(){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("orderFilDate1").valueAsDate,
            endDate: document.getElementById("orderFilDate2").valueAsDate,
            ingredients: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let ingredientChoices = document.getElementById("ingredientDropdown");
        for(let i = 0; i < ingredientChoices.children.length; i += 3){
            if(ingredientChoices.children[i].checked){
                data.ingredients.push(ingredientChoices.children[i].ingredient.id);
            }
        }

        if(data.ingredients.length === 0){
            for(let i = 0; i < merchant.ingredients.length; i++){
                data.ingredients.push(merchant.ingredients[i].ingredient.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let orderList = document.getElementById("orderList");
                    let template = document.getElementById("order").content.children[0];

                    while(orderList.children.length > 0){
                        orderList.removeChild(orderList.firstChild);
                    }

                    for(let i = 0; i < response.length; i++){
                        let order = template.cloneNode(true);
                        let cost = 0;
                        for(let j = 0; j < response[i].ingredients.length; j++){
                            cost += (response[i].ingredients[j].price / 100) * response[i].ingredients[j].quantity;
                        }

                        order.children[0].innerText = response[i].name,
                        order.children[1].innerText = `${response[i].ingredients.length} items`;
                        order.children[2].innerText = new Date(response[i].date).toLocaleDateString();
                        order.children[3].innerText = `$${cost.toFixed(2)}`;
                        orderList.appendChild(order);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE ORDERS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    toggleDropdown: function(dropdown){
        event.preventDefault();
        let polyline = dropdown.parentElement.children[0].children[1].children[0].children[0];

        if(dropdown.style.display === "none"){
            dropdown.style.display = "block";
            polyline.setAttribute("points", "18 15 12 9 6 15");
        }else{
            dropdown.style.display = "none";
            polyline.setAttribute("points", "6 9 12 15 18 9");
        }
    }
}
},{}],12:[function(require,module,exports){
module.exports = {
    isPopulated: false,
    recipeDivList: [],

    display: function(){
        if(!this.isPopulated){
            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.getElementById("recipeList");
        let template = document.getElementById("recipe").content.children[0];

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.onclick = ()=>{recipeDetailsComp.display(merchant.recipes[i])};
            recipeDiv._name = merchant.recipes[i].name;
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
            recipeDiv.children[1].innerText = `$${(merchant.recipes[i].price / 100).toFixed(2)}`;

            this.recipeDivList.push(recipeDiv);
        }
    },

    search: function(){
        let input = document.getElementById("recipeSearch").value.toLowerCase();
        let recipeList = document.getElementById("recipeList");
        let clearButton = document.getElementById("recipeClearButton");

        let matchingRecipes = [];
        for(let i = 0; i < this.recipeDivList.length; i++){
            if(this.recipeDivList[i]._name.toLowerCase().includes(input)){
                matchingRecipes.push(this.recipeDivList[i]);
            }
        }

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }
        for(let i = 0; i < matchingRecipes.length; i++){
            recipeList.appendChild(matchingRecipes[i]);
        }

        if(input === ""){
            clearButton.style.display = "none";
        }else{
            clearButton.style.display = "inline";
        }
    },

    clearSorting: function(){
        document.getElementById("recipeSearch").value = "";
        this.search();
    },

    posUpdate: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update/clover", {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                let newRecipes = [];
                for(let i = 0; i < response.new.length; i++){
                    newRecipes.push(new Recipe(
                        response.new[i]._id,
                        response.new[i].name,
                        response.new[i].price,
                        merchant,
                        []
                    ));
                }
                if(newRecipes.length > 0){
                    merchant.editRecipes(newRecipes);
                }

                let removeRecipes = [];
                for(let i = 0; i < response.removed.length; i++){
                    for(let j = 0; j < merchant.recipes.length; j++){
                        if(response.removed[i]._id === merchant.recipes[j].id){
                            removeRecipes.push(merchant.recipes[j], true);
                            break;
                        }
                    }
                }
                if(removeRecipes.length > 0){
                    merchant.editRecipes(removeRecipes, true);
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}
},{}],13:[function(require,module,exports){
module.exports = {
    recipe: {},

    display: function(recipe){
        this.recipe = recipe;
        openSidebar(document.querySelector("#recipeDetails"));

        document.querySelector("#recipeName").style.display = "block";
        document.querySelector("#recipeNameIn").style.display = "none";
        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.querySelector("#recipeIngredientList");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.querySelector("#recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            ingredientDiv = template.cloneNode(true);

            ingredientDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `${recipe.ingredients[i].ingredient.convert(recipe.ingredients[i].quantity).toFixed(2)} ${recipe.ingredients[i].ingredient.unit}`;
            ingredientDiv.ingredient = recipe.ingredients[i].ingredient;
            ingredientDiv.name = recipe.ingredients[i].ingredient.name;

            ingredientList.appendChild(ingredientDiv);
        }

        document.querySelector("#addRecIng").style.display = "none";

        let price = document.querySelector("#recipePrice");
        price.children[1].style.display = "block";
        price.children[2].style.display = "none";
        price.children[1].innerText = `$${(recipe.price / 100).toFixed(2)}`;

        document.querySelector("#recipeUpdate").style.display = "none";
    },

    edit: function(){
        let ingredientDivs = document.querySelector("#recipeIngredientList");

        if(merchant.pos === "none"){
            let name = document.querySelector("#recipeName");
            let nameIn = document.querySelector("#recipeNameIn");
            name.style.display = "none";
            nameIn.style.display = "block";
            nameIn.value = this.recipe.name;

            let price = document.querySelector("#recipePrice");
            price.children[1].style.display = "none";
            price.children[2].style.display = "block";
            price.children[2].value = parseFloat((this.recipe.price / 100).toFixed(2));
        }

        for(let i = 0; i < ingredientDivs.children.length; i++){
            let div = ingredientDivs.children[i];

            div.children[2].innerText = this.recipe.ingredients[i].ingredient.unit;
            div.children[1].style.display = "block";
            div.children[1].value = this.recipe.ingredients[i].ingredient.convert(this.recipe.ingredients[i].quantity).toFixed(2);
            div.children[3].style.display = "block";
            div.children[3].onclick = ()=>{div.parentElement.removeChild(div)};
        }

        document.querySelector("#addRecIng").style.display = "flex";
        document.querySelector("#recipeUpdate").style.display = "flex";
    },

    update: function(){
        this.recipe.name = document.querySelector("#recipeNameIn").value || this.recipe.name;
        this.recipe.price = Math.round((document.querySelector("#recipePrice").children[2].value * 100)) || this.recipe.price;
        this.recipe.ingredients = [];

        let divs = document.querySelector("#recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                let select = divs[i].children[0];
                this.recipe.ingredients.push({
                    ingredient: select.options[select.selectedIndex].ingredient,
                    quantity: convertToMain(select.options[select.selectedIndex].ingredient.unit, divs[i].children[1].value)
                });
            }else{
                this.recipe.ingredients.push({
                    ingredient: divs[i].ingredient,
                    quantity: convertToMain(divs[i].ingredient.unit, divs[i].children[1].value)
                });
            }
        }

        let data = {
            id: this.recipe.id,
            name: this.recipe.name,
            price: this.recipe.price,
            ingredients: []
        }

        for(let i = 0; i < this.recipe.ingredients.length; i++){
            data.ingredients.push({
                ingredient: this.recipe.ingredients[i].ingredient.id,
                quantity: this.recipe.ingredients[i].quantity
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editRecipes([this.recipe]);
                    banner.createNotification("RECIPE UPDATE");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    remove: function(){
        fetch(`/merchant/recipes/remove/${this.recipe.id}`, {
            method: "DELETE"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editRecipes([this.recipe], true);
                    banner.createNotification("RECIPE REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            });
    },

    displayAddIngredient: function(){
        let template = document.querySelector("#addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.querySelector("#recipeIngredientList").appendChild(template);

        let categories = merchant.categorizeIngredients();

        for(let i = 0; i < categories.length; i++){
            let optGroup = document.createElement("optgroup");
            optGroup.label = categories[i].name;
            template.children[0].appendChild(optGroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                option.ingredient = categories[i].ingredients[j].ingredient;
                optGroup.appendChild(option);
            }
        }
    }
}
},{}],14:[function(require,module,exports){
module.exports = {
    transaction: {},

    display: function(transaction){
        this.transaction = transaction;

        let recipeList = document.getElementById("transactionRecipes");
        let template = document.getElementById("transactionRecipe").content.children[0];
        let totalRecipes = 0;
        let totalPrice = 0;

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < transaction.recipes.length; i++){
            let recipe = template.cloneNode(true);
            let price = transaction.recipes[i].quantity * transaction.recipes[i].recipe.price;

            recipe.children[0].innerText = transaction.recipes[i].recipe.name;
            recipe.children[1].innerText = `${transaction.recipes[i].quantity} x $${parseFloat(transaction.recipes[i].recipe.price / 100).toFixed(2)}`;
            recipe.children[2].innerText = `$${(price / 100).toFixed(2)}`;
            recipeList.appendChild(recipe);

            totalRecipes += transaction.recipes[i].quantity;
            totalPrice += price;
        }

        let months = ["January", "Fecbruary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dateString = `${days[transaction.date.getDay()]}, ${months[transaction.date.getMonth()]} ${transaction.date.getDate()}, ${transaction.date.getFullYear()}`;

        document.getElementById("transactionDate").innerText = dateString;
        document.getElementById("transactionTime").innerText = transaction.date.toLocaleTimeString();
        document.getElementById("totalRecipes").innerText = `${totalRecipes} recipes`;
        document.getElementById("totalPrice").innerText = `$${(totalPrice / 100).toFixed(2)}`;

        openSidebar(document.getElementById("transactionDetails"));
    },

    remove: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/transaction/${this.transaction.id}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.editTransactions(this.transaction, true);
                    banner.createNotification("TRANSACTION REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}
},{}],15:[function(require,module,exports){
module.exports = {
    isPopulated: false, 

    display: function(){
        if(!this.isPopulated){
            let transactionsList = document.getElementById("transactionsList");
            let dateDropdown = document.getElementById("dateDropdown");
            let recipeDropdown = document.getElementById("recipeDropDown");
            let template = document.getElementById("transaction").content.children[0];

            let now = new Date();
            let monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            document.getElementById("transFilDate1").valueAsDate = monthAgo;
            document.getElementById("transFilDate2").valueAsDate = now;

            dateDropdown.style.display = "none";
            recipeDropdown.style.display = "none";

            document.getElementById("dateFilterBtn").onclick = ()=>{this.toggleDropdown(dateDropdown)};
            document.getElementById("recipeFilterBtn").onclick = ()=>{this.toggleDropdown(recipeDropdown)};

            while(recipeDropdown.children.length > 0){
                recipeDropdown.removeChild(recipeDropdown.firstChild);
            }

            for(let i = 0; i < merchant.recipes.length; i++){
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.recipe = merchant.recipes[i];
                recipeDropdown.appendChild(checkbox);

                let label = document.createElement("label");
                label.innerText = merchant.recipes[i].name;
                label.for = checkbox;
                recipeDropdown.appendChild(label);

                let brk = document.createElement("br");
                recipeDropdown.appendChild(brk);
            }

            while(transactionsList.children.length > 0){
                transactionsList.removeChild(transactionsList.firstChild);
            }

            let i = 0
            while(i < merchant.transactions.length && i < 100){
                let transactionDiv = template.cloneNode(true);
                let transaction = merchant.transactions[i];

                transactionDiv.onclick = ()=>{transactionDetailsComp.display(transaction)};
                transactionsList.appendChild(transactionDiv);

                let totalRecipes = 0;
                let totalPrice = 0;

                for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                    totalRecipes += merchant.transactions[i].recipes[j].quantity;
                    totalPrice += merchant.transactions[i].recipes[j].recipe.price * merchant.transactions[i].recipes[j].quantity;
                }

                transactionDiv.children[0].innerText = `${merchant.transactions[i].date.toLocaleDateString()} ${merchant.transactions[i].date.toLocaleTimeString()}`;
                transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
                transactionDiv.children[2].innerText = `$${(totalPrice / 100).toFixed(2)}`;

                i++;
            }

            this.isPopulated = true;
        }
    },

    submitFilter: function(){
        event.preventDefault();

        let data = {
            startDate: document.getElementById("transFilDate1").valueAsDate,
            endDate: document.getElementById("transFilDate2").valueAsDate,
            recipes: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let recipeChoices = document.getElementById("recipeDropDown");
        for(let i = 0; i < recipeChoices.children.length; i += 3){
            if(recipeChoices.children[i].checked){
                data.recipes.push(recipeChoices.children[i].recipe.id);
            }
        }

        if(data.recipes.length === 0){
            for(let i = 0; i < merchant.recipes.length; i++){
                data.recipes.push(merchant.recipes[i].id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let transactionList = document.getElementById("transactionsList");
                    let template = document.getElementById("transaction").content.children[0];

                    while(transactionList.children.length > 0){
                        transactionList.removeChild(transactionList.firstChild);
                    }

                    for(let i = 0; i < response.length; i++){
                        let transactionDiv = template.cloneNode(true);
                        let recipeCount = 0;
                        let cost = 0;
                        let transaction = new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        );

                        for(let j = 0; j < transaction.recipes.length; j++){
                            recipeCount += transaction.recipes[j].quantity;
                            cost += transaction.recipes[j].quantity * transaction.recipes[j].recipe.price;
                        }

                        transactionDiv.children[0].innerText = `${transaction.date.toLocaleDateString()} ${transaction.date.toLocaleTimeString()}`;
                        transactionDiv.children[1].innerText = `${recipeCount} recipes sold`;
                        transactionDiv.children[2].innerText = `$${(cost / 100).toFixed(2)}`;
                        transactionDiv.onclick = ()=>{transactionDetailsComp.display(transaction)};
                        transactionList.appendChild(transactionDiv);
                    }
                }
            })
            .catch((err)=>{
                banner.createError("UNABLE TO DISPLAY THE TRANSACTIONS");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    toggleDropdown: function(dropdown){
        event.preventDefault();
        let polyline = dropdown.parentElement.children[0].children[1].children[0].children[0];

        if(dropdown.style.display === "none"){
            dropdown.style.display = "block";
            polyline.setAttribute("points", "18 15 12 9 6 15");
        }else{
            dropdown.style.display = "none";
            polyline.setAttribute("points", "6 9 12 15 18 9");
        }
    }
}
},{}]},{},[2]);