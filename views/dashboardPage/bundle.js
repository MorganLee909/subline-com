(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

module.exports = Ingredient;
},{}],2:[function(require,module,exports){
const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Transaction = require("./Transaction.js");

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
            length: ["mm", "cm", "m", "in", "foot"],
            other: ["each"]
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
            for(let j = 0; j < this.ingredients.length; j++){
                if(this.ingredients[j].ingredient === ingredients[i].ingredient){
                    if(remove){
                        this.ingredients.splice(j, 1);
                    }else if(!remove && isOrder){
                        this.ingredients[j].quantity += ingredients[i].quantity;
                    }else{
                        this.ingredients[j].quantity = ingredients[i].quantity;
                    }
    
                    isNew = false;
                    break;
                }
            }
    
            if(isNew){
                this.ingredients.push({
                    ingredient: ingredients[i].ingredient,
                    quantity: parseFloat(ingredients[i].quantity),
                    defaultUnit: ingredients[i].defaultUnit
                });
            }
        }
    
        controller.updateData("ingredient");
        controller.closeSidebar();
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
                this.recipes.push(recipes[i]);
            }
        }

        controller.updateData("recipe");
        controller.closeSidebar();
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

        controller.updateData("order");
        controller.closeSidebar();
    }

    /*
    transaction = Transaction Object to add
    ingredients = The ingredients that need to be updated
        keys = ingredient ids
        values = quantity to change in grams
    remove = If true, removes transaction
    */
    editTransactions(transaction, ingredients, remove = false, ){
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

        let keys = Object.keys(ingredients);
        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < this.ingredients.length; j++){
                if(this.ingredients[j].ingredient.id === keys[i]){
                    if(remove === false){
                        this.ingredients[j].quantity -= ingredients[keys[i]];
                    }else{
                        this.ingredients[j].quantity += ingredients[keys[i]];
                    }

                    break;
                }
            }
        }

        controller.updateData("ingredient");
        controller.updateData("transaction");
        controller.closeSidebar();
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

module.exports = Merchant;
},{"./Ingredient.js":1,"./Recipe.js":4,"./Transaction.js":5}],3:[function(require,module,exports){
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

                    break;
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

module.exports = Order;
},{}],4:[function(require,module,exports){
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

module.exports = Recipe;
},{}],5:[function(require,module,exports){
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

module.exports = Transaction;
},{}],6:[function(require,module,exports){
const Transaction = require("./Transaction");

let analytics = {
    transactions: {},
    ingredient: {},

    display: function(){
        let startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const dateIndices = controller.transactionIndices(merchant.transactions, startDate);

        this.transactions = merchant.transactions.slice(dateIndices[0], dateIndices[1]);
        const itemsList = document.getElementById("itemsList");

        let now = new Date();
        let lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes());

        document.getElementById("analStartDate").valueAsDate = lastMonth;
        document.getElementById("analEndDate").valueAsDate = now;
        document.getElementById("analDateBtn").onclick = ()=>{this.changeDates()};

        while(itemsList.children.length > 0){
            itemsList.removeChild(itemsList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("itemButton");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            li.onclick = ()=>{
                const itemsList = document.getElementById("itemsList");
                for(let i = 0; i < itemsList.children.length; i++){
                    itemsList.children[i].classList.remove("analItemActive");
                }

                li.classList.add("analItemActive");

                this.ingredient = merchant.ingredients[i];
                this.ingredientDisplay();
            };
            itemsList.appendChild(li);
        }
    },

    ingredientDisplay: function(){
        //Get list of recipes that contain the ingredient
        let containingRecipes = [];

        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(merchant.recipes[i].ingredients[j].ingredient === this.ingredient.ingredient){
                    containingRecipes.push({
                        recipe: merchant.recipes[i],
                        quantity: merchant.recipes[i].ingredients[j].quantity
                    });

                    break;
                }
            }
        }

        //Create Graph
        let quantities = [];
        let dates = [];
        let currentDate = this.transactions[0].date;
        let currentQuantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(this.ingredient.ingredient.convert(currentQuantity));
                dates.push(currentDate);
                currentQuantity = 0;
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < containingRecipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === containingRecipes[k].recipe){
                        for(let l = 0; l < this.transactions[i].recipes[j].recipe.ingredients.length; l++){
                            const transIngredient = this.transactions[i].recipes[j].recipe.ingredients[l];

                            if(transIngredient.ingredient === this.ingredient.ingredient){
                                currentQuantity += transIngredient.quantity * this.transactions[i].recipes[j].quantity;

                                break;
                            }
                        }
                    }
                }
            }
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.ingredient.ingredient.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: `QUANTITY (${this.ingredient.ingredient.unit.toUpperCase()})`,
            }
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create use cards
        let sum = 0;
        let max = 0;
        let min = quantities[0];
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
            if(quantities[i] > max){
                max = quantities[i];
            }else if(quantities[i] < min){
                min = quantities[i];
            }
        }
        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.ingredient.unit}`;        
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.ingredient.unit}`;

        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
    },

    changeDates: function(){
        let dates = {
            from: document.getElementById("analStartDate").valueAsDate,
            to: document.getElementById("analEndDate").valueAsDate
        }

        if(dates.from > dates.to || dates.from === "" || dates.to === "" || dates.to > new Date()){
            banner.createError("INVALID DATE");
            return;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction/retrieve", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(dates)
        })
            .then((response)=>response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response.data);
                }else{
                    this.transactions = [];                    

                    for(let i = 0; i < response.length; i++){
                        this.transactions.push(new Transaction(
                            response[i]._id,
                            new Date(response[i].date),
                            response[i].recipes,
                            merchant
                        ));
                    }
                    
                    this.ingredientDisplay();
                }
            })
            .catch((err)=>{
                banner.createError("ERROR: UNABLE TO DISPLAY THE DATA");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = analytics;
},{"./Transaction":5}],7:[function(require,module,exports){
const home = require("./home.js");
const ingredients = require("./ingredients.js");
const recipeBook = require("./recipeBook.js");
const analytics = require("./analytics.js");
const orders = require("./orders.js");
const transactions = require("./transactions.js");

const ingredientDetails = require("./ingredientDetails.js");
const newIngredient = require("./newIngredient.js");
const newOrder = require("./newOrder.js");
const newRecipe = require("./newRecipe.js");
const newTransaction = require("./newTransaction.js");
const orderDetails = require("./orderDetails.js");
const recipeDetails = require("./recipeDetails.js");
const transactionDetails = require("./transactionDetails.js");

const Merchant = require("./Merchant.js");
const Ingredient = require("./Ingredient.js");
const Recipe = require("./Recipe.js");
const Order = require("./Order.js");
const Transaction = require("./Transaction.js");

merchant = new Merchant(data.merchant, data.transactions);

controller = {
    openStrand: function(strand){
        this.closeSidebar();

        let strands = document.querySelectorAll(".strand");
        for(let i = 0; i < strands.length; i++){
            strands[i].style.display = "none";
        }

        let buttons = document.querySelectorAll(".menuButton");
        for(let i = 0; i < buttons.length - 1; i++){
            buttons[i].classList = "menuButton";
            buttons[i].disabled = false;
        }

        let activeButton = {};
        switch(strand){
            case "home": 
                activeButton = document.getElementById("homeBtn");
                document.getElementById("homeStrand").style.display = "flex";
                home.display();
                break;
            case "ingredients": 
                activeButton = document.getElementById("ingredientsBtn");
                document.getElementById("ingredientsStrand").style.display = "flex";
                ingredients.display();
                break;
            case "recipeBook":
                activeButton = document.getElementById("recipeBookBtn");
                document.getElementById("recipeBookStrand").style.display = "flex";
                recipeBook.display(Recipe);
                break;
            case "analytics":
                activeButton = document.getElementById("analyticsBtn");
                document.getElementById("analyticsStrand").style.display = "flex";
                analytics.display();
                break;
            case "orders":
                activeButton = document.getElementById("ordersBtn");
                document.getElementById("ordersStrand").style.display = "flex";
                orders.display(Order);
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                transactions.display(Transaction);
                break;
        }

        activeButton.classList = "menuButton active";
        activeButton.disabled = true;

        if(window.screen.availWidth <= 1000){
            this.closeMenu();
        }
    },

    /*
    Open a specific sidebar
    Input:
    sidebar: the outermost element of the sidebar (must contain class sidebar)
    */
    openSidebar: function(sidebar, data = {}){
        this.closeSidebar();

        document.getElementById("sidebarDiv").classList = "sidebar";
        document.getElementById(sidebar).style.display = "flex";

        switch(sidebar){
            case "ingredientDetails":
                ingredientDetails.display(data);
                break;
            case "addIngredients":
                addIngredients.display(Merchant);
                break;
            case "newIngredient":
                newIngredient.display(Ingredient);
                break;
            case "recipeDetails":
                recipeDetails.display(data);
                break;
            case "addRecipe":
                newRecipe.display(Recipe);
                break;
            case "orderDetails":
                orderDetails.display(data);
                break;
            case "newOrder":
                newOrder.display(Order);
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "newTransaction":
                newTransaction.display(Transaction);
                break;
        }

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "none";
            document.getElementById("mobileMenuSelector").style.display = "none";
            document.getElementById("sidebarCloser").style.display = "block";
        }
    },

    closeSidebar: function(){
        let sidebar = document.getElementById("sidebarDiv");
        for(let i = 0; i < sidebar.children.length; i++){
            sidebar.children[i].style.display = "none";
        }
        sidebar.classList = "sidebarHide";

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "flex";
            document.getElementById("mobileMenuSelector").style.display = "block";
            document.getElementById("sidebarCloser").style.display = "none";
        }
    },

    changeMenu: function(){
        let menu = document.querySelector(".menu");
        let buttons = document.querySelectorAll(".menuButton");
        if(!menu.classList.contains("menuMinimized")){
            menu.classList = "menu menuMinimized";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "none";
            }

            document.getElementById("max").style.display = "none";
            document.getElementById("min").style.display = "flex";

            
        }else if(menu.classList.contains("menuMinimized")){
            menu.classList = "menu";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "block";
            }

            setTimeout(()=>{
                document.getElementById("max").style.display = "flex";
                document.getElementById("min").style.display = "none";
            }, 150);
        }
    },

    openMenu: function(){
        document.getElementById("menu").style.display = "flex";
        document.querySelector(".contentBlock").style.display = "none";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.closeMenu()};
    },

    closeMenu: function(){
        document.getElementById("menu").style.display = "none";
        document.querySelector(".contentBlock").style.display = "flex";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.openMenu()};
    },

    convertToMain: function(unit, quantity){
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
    },

    /*
    Sets certain strands to repopulate everything the next time it is opened
    Use for when any data is changed
    item = whatever is being updated
    */
    updateData: function(item){
        switch(item){
            case "ingredient":
                home.isPopulated = false;
                ingredients.populateByProperty("category");
                home.isPopulated = false;
                break;
            case "recipe":
                transactions.isPopulated = false;
                recipeBook.populateRecipes();
                break;
            case "order":
                orders.populate();
                break;
            case "transaction":
                transactions.isPopulated = false;
                transactions.display(Transaction);
                break;
        }
    },

    /*
    Gets the indices of two dates from transactions
    Inputs
    transactions: transaction list to find indices on
    from: starting date
    to: ending date (default to now)
    Output
    Array containing starting index and ending index
    Note: Will return false if it cannot find both necessary dates
    */
    transactionIndices(transactions, from, to = new Date()){
        let indices = [];

        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].date > from){
                indices.push(i);
                break;
            }
        }

        for(let i = transactions.length - 1; i >=0; i--){
            if(transactions[i].date < to){
                indices.push(i);
                break;
            }
        }

        if(indices.length < 2){
            return false;
        }

        return indices;
    }
}

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    this.changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}

controller.openStrand("home");
},{"./Ingredient.js":1,"./Merchant.js":2,"./Order.js":3,"./Recipe.js":4,"./Transaction.js":5,"./analytics.js":6,"./home.js":8,"./ingredientDetails.js":9,"./ingredients.js":10,"./newIngredient.js":11,"./newOrder.js":12,"./newRecipe.js":13,"./newTransaction.js":14,"./orderDetails.js":15,"./orders.js":16,"./recipeBook.js":17,"./recipeDetails.js":18,"./transactionDetails.js":19,"./transactions.js":20}],8:[function(require,module,exports){
let home = {
    isPopulated: false,

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
        let lastMonthToDay = new Date(new Date().setMonth(today.getMonth() - 1));

        let revenueThisMonth = merchant.revenue(controller.transactionIndices(merchant.transactions, firstOfMonth));
        let revenueLastmonthToDay = merchant.revenue(controller.transactionIndices(merchant.transactions, firstOfLastMonth, lastMonthToDay));

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toLocaleString("en")}`;

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
        let monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let dateIndices = controller.transactionIndices(merchant.transactions, monthAgo);

        let revenue = [];
        let dates = [];
        let dayRevenue = 0;
        let currentDate = merchant.transactions[dateIndices[0]].date;
        for(let i = dateIndices[0]; i < dateIndices[1]; i++){
            if(merchant.transactions[i].date.getDate() !== currentDate.getDate()){
                revenue.push(dayRevenue / 100);
                dayRevenue = 0;
                dates.push(currentDate);
                currentDate = merchant.transactions[i].date;
            }

            for(let j = 0; j < merchant.transactions[i].recipes.length; j++){
                const recipe = merchant.transactions[i].recipes[j];

                dayRevenue += recipe.recipe.price * recipe.quantity;
            }
        }

        const trace = {
            x: dates,
            y: revenue,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: "REVENUE",
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "$"
            }
        }

        Plotly.newPlot("graphCard", [trace], layout);
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
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];
            const ingredient = merchant.ingredients[rands[i]];

            ingredientCheck.ingredient = ingredient;
            ingredientCheck.children[0].innerText = ingredient.ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{input.value--};
            input.value = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);
            ingredientCheck.children[1].children[2].onclick = ()=>{input.value++}
            ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let thisMonth = new Date();
        thisMonth.setDate(1);

        let ingredientList = merchant.ingredientsSold(controller.transactionIndices(merchant.transactions, thisMonth));
        if(ingredientList !== false){
            ingredientList.sort((a, b) => a.quantity < b.quantity);

            let quantities = [];
            let names = [];
            let labels = [];
            let colors = [];
            for(let i = 4; i >= 0; i--){
                quantities.push(ingredientList[i].quantity);
                names.push(ingredientList[i].ingredient.name.toUpperCase());
                labels.push(`${ingredientList[i].ingredient.convert(ingredientList[i].quantity).toFixed(2)} ${ingredientList[i].ingredient.unit.toUpperCase()}`);
                if(i === 0){
                    colors.push("rgb(255, 99, 107");
                }else{
                    colors.push("rgb(179, 191, 209");
                }
            }

            let trace = {
                x: quantities,
                y: names,
                type: "bar",
                orientation: "h",
                text: labels,
                textposition: "auto",
                hoverinfo: "none",
                marker: {
                    color: colors
                }
            }

            let layout = {
                title: "MOST POPULAR INGREDIENTS",
                xaxis: {
                    zeroline: false,
                    title: "QUANTITY IN GRAMS"
                }
            }
            
            Plotly.newPlot("popularIngredientsCard", [trace], layout);
        }else{
            document.getElementById("popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.getElementById("popularIngredientsCard").appendChild(notice);
        }
    },

    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];
        let fetchData = [];

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

                    fetchData.push({
                        id: merchIngredient.ingredient.id,
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
        
        if(fetchData.length > 0){
            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(fetchData)
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

module.exports = home;
},{}],9:[function(require,module,exports){
let ingredientDetails = {
    ingredient: {},
    dailyUse: 0,

    display: function(ingredient){
        this.ingredient = ingredient;

        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;

        let categoryInput = document.getElementById("detailsCategoryInput");
        categoryInput.value = "";
        categoryInput.placeholder = ingredient.ingredient.category;

        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        
        let nameInput = document.getElementById("ingredientDetailsNameIn");
        nameInput.value = "";
        nameInput.placeholder = ingredient.ingredient.name;

        let stockInput = document.getElementById("ingredientInput");
        document.getElementById("ingredientStock").innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        stockInput.value = "";
        stockInput.placeholder = ingredient.ingredient.convert(ingredient.quantity).toFixed(2);

        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);
            let indices = controller.transactionIndices(merchant.transactions, startDay, endDay);

            if(indices === false){
                quantities.push(0);
            }else{
                quantities.push(merchant.singleIngredientSold(indices, ingredient));
            }
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        document.getElementById("dailyUse").innerText = `${ingredient.ingredient.convert(dailyUse).toFixed(2)} ${ingredient.ingredient.unit}`;

        let ul = document.getElementById("ingredientRecipeList");
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < recipes.length; i++){
            let li = document.createElement("li");
            li.innerText = recipes[i].name;
            li.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            ul.appendChild(li);
        }

        let ingredientButtons = document.getElementById("ingredientButtons");
        let units = [];
        if(this.ingredient.ingredient.unitType !== "other"){
            units = merchant.units[this.ingredient.ingredient.unitType];
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

        let add = document.querySelectorAll(".editAdd");
        let remove = document.querySelectorAll(".editRemove");

        for(let i = 0; i < add.length; i++){
            add[i].style.display = "none";
        }

        for(let i = 0; i < remove.length; i++){
            remove[i].style.display = "block";
        }

        document.getElementById("editSubmitButton").onclick = ()=>{this.editSubmit()};
        document.getElementById("editCancelButton").onclick = ()=>{this.display(this.ingredient)};
        document.getElementById("editIngBtn").onclick = ()=>{this.edit()};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove()};
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
        let add = document.querySelectorAll(".editAdd");
        let remove = document.querySelectorAll(".editRemove");

        for(let i = 0; i < add.length; i++){
            add[i].style.display = "flex";
        }

        for(let i = 0; i < remove.length; i++){
            remove[i].style.display = "none";
        }
    },

    editSubmit: function(){
        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            if(ingredientButtons[i].classList.contains("unitActive")){
                this.ingredient.ingredient.unit = ingredientButtons[i].innerText.toLowerCase();
                break;
            }
        }

        const quantityElem = document.getElementById("ingredientInput");
        if(quantityElem.value !== ""){
            this.ingredient.quantity = controller.convertToMain(
                this.ingredient.ingredient.unit,
                Number(document.getElementById("ingredientInput").value)
            );
        }

        const category = document.getElementById("detailsCategoryInput");
        this.ingredient.ingredient.category = (category.value === "") ? this.ingredient.ingredient.category : category.value;

        const name = document.getElementById("ingredientDetailsNameIn");
        this.ingredient.ingredient.name = (name.value === "") ? this.ingredient.ingredient.name : name.value;
        
        let data = {
            id: this.ingredient.ingredient.id,
            name: this.ingredient.ingredient.name,
            quantity: this.ingredient.quantity,
            category: this.ingredient.ingredient.category,
            defaultUnit: this.ingredient.ingredient.unit
        };

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/update", {
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

                    this.display(this.ingredient);

                    banner.createNotification("INGREDIENT UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    changeUnit: function(newActive, unit){
        let ingredientButtons = document.querySelectorAll(".unitButton");
        for(let i = 0; i < ingredientButtons.length; i++){
            ingredientButtons[i].classList.remove("unitActive");
        }

        newActive.classList.add("unitActive");
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

module.exports = ingredientDetails;
},{}],10:[function(require,module,exports){
let ingredients = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            this.populateByProperty("category");

            document.getElementById("ingredientSearch").oninput = ()=>{this.search()};
            document.getElementById("ingredientClearButton").onclick = ()=>{this.clearSorting()};
            document.getElementById("ingredientSelect").onchange = ()=>{this.sort()};

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
        
        let ingredientStrand = document.getElementById("categoryList");
        let categoryTemplate = document.getElementById("categoryDiv").content.children[0];
        let ingredientTemplate = document.getElementById("ingredient").content.children[0];
        this.ingredients = [];

        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name;
            
            categoryDiv.children[0].children[1].onclick = ()=>{
                this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1]);
            };
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.ingredient.name;
                ingredientDiv.children[2].innerText = `${ingredient.ingredient.convert(ingredient.quantity).toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
                ingredientDiv.onclick = ()=>{controller.openSidebar("ingredientDetails", ingredient)};
                ingredientDiv._name = ingredient.ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.ingredient.unit.toLowerCase();

                categoryDiv.children[1].appendChild(ingredientDiv);
                this.ingredients.push(ingredientDiv);
            }
        }

    },

    displayIngredientsOnly: function(ingredients){
        let ingredientDiv = document.getElementById("categoryList");

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
        let input = document.getElementById("ingredientSearch").value.toLowerCase();
        document.getElementById("ingredientSelect").selectedIndex = 0;

        if(input === ""){
            this.populateByProperty("category");
            document.getElementById("ingredientClearButton").style.display = "none";
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        document.getElementById("ingredientClearButton").style.display = "inline";
        this.displayIngredientsOnly(matchingIngredients);
    },

    sort: function(){
        let sortType = document.getElementById("ingredientSelect").value;
        
        if(sortType === ""){
            return;
        }

        document.getElementById("ingredientSearch").value = "";

        if(sortType === "category"){
            this.populateByProperty("category");
            return;
        }

        if(sortType === "unit"){
            this.populateByProperty("unit");
            return;
        }

        document.getElementById("ingredientClearButton").style.display = "inline";
        let sortedIngredients = this.ingredients.slice().sort((a, b)=> (a[sortType] > b[sortType]) ? 1 : -1);
        this.displayIngredientsOnly(sortedIngredients);
    },

    clearSorting: function(button){
        document.getElementById("ingredientSearch").value = "";
        document.getElementById("ingredientSelect").selectedIndex = 0;
        document.getElementById("ingredientClearButton").style.display = "none";

        this.populateByProperty("category");
    }
}

module.exports = ingredients;
},{}],11:[function(require,module,exports){
let newIngredient = {
    display: function(Ingredient){
        document.getElementById("newIngName").value = "";
        document.getElementById("newIngCategory").value = "";
        document.getElementById("newIngQuantity").value = 0;

        document.getElementById("submitNewIng").onclick = ()=>{this.submit(Ingredient)};
    },

    submit: function(Ingredient){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type"),
            },
            quantity: controller.convertToMain(unit, document.getElementById("newIngQuantity").value),
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

module.exports = newIngredient;
},{}],12:[function(require,module,exports){
let newOrder = {
    display: function(Order){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";

        let selectedList = document.getElementById("selectedIngredientList");
        while(selectedList.children.length > 0){
            selectedList.removeChild(selectedList.firstChild);
        }

        let ingredientList = document.getElementById("newOrderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let ingredient = document.createElement("button");
            ingredient.classList = "newOrderIngredient";
            ingredient.innerText = merchant.ingredients[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.ingredients[i].ingredient, ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit(Order)};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[0].innerText = `${ingredient.name} (${ingredient.unit.toUpperCase()})`;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};
        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(Order){
        let date = document.getElementById("newOrderDate").value;
        let time = document.getElementById("newOrderTime").value;
        let ingredients = document.getElementById("selectedIngredientList").children;

        if(date === ""){
            banner.createError("DATE IS REQUIRED FOR ORDERS");
            return;
        }
        
        if(time !== ""){
            date = `${date}T${time}`;
        }

        let data = {
            name: document.getElementById("newOrderName").value,
            date: date,
            ingredients: []
        }

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let price = ingredients[i].children[1].children[1].value;

            if(quantity === "" || price === ""){
                banner.createError("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS");
                return;
            }

            if(quantity < 0 || price < 0){
                banner.createError("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS");
            }

            data.ingredients.push({
                ingredient: ingredients[i].ingredient.id,
                quantity: controller.convertToMain(ingredients[i].ingredient.unit, quantity),
                price: price * 100
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response)=>response.json())
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
                    );

                    merchant.editOrders([order]);
                    merchant.editIngredients(order.ingredients, false, true);
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = newOrder;
},{}],13:[function(require,module,exports){
let newRecipe = {
    display: function(Recipe){
        let ingredientsSelect = document.querySelector("#recipeInputIngredients select");
        let categories = merchant.categorizeIngredients();

        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let optgroup = document.createElement("optgroup");
            optgroup.label = categories[i].name;
            ingredientsSelect.appendChild(optgroup);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.value = categories[i].ingredients[j].ingredient.id;
                option.innerText = `${categories[i].ingredients[j].ingredient.name} (${categories[i].ingredients[j].ingredient.unit})`;
                optgroup.appendChild(option);
            }
        }

        document.getElementById("ingredientCount").onclick = ()=>{this.changeRecipeCount()};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeRecipeCount: function(){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
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

    submit: function(Recipe){
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
                        quantity: controller.convertToMain(merchant.ingredients[j].ingredient.unit, inputs[i].children[2].children[0].value)
                    });

                    break;
                }
            }
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

module.exports = newRecipe;
},{}],14:[function(require,module,exports){
let newTransaction = {
    display: function(Transaction){
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

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit(Transaction)};
    },

    submit: function(Transaction){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
        let data = {
            date: date,
            recipes: [],
            ingredientUpdates: {}
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            const recipe = recipeDivs.children[i].recipe;
            if(quantity !== "" && quantity > 0){
                data.recipes.push({
                    recipe: recipe.id,
                    quantity: quantity
                });

                for(let j = 0; j < recipe.ingredients.length; j++){
                    const ingredient = recipe.ingredients[j];

                    if(data.ingredientUpdates[ingredient.ingredient.id]){
                        data.ingredientUpdates[ingredient.ingredient.id] += ingredient.quantity * quantity;
                    }else{
                        data.ingredientUpdates[ingredient.ingredient.id] = ingredient.quantity * quantity;
                    }
                }
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
                return;
            }
        }

        if(data.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
                method: "post",
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
                        let transaction = new Transaction(
                            response._id,
                            response.date,
                            response.recipes,
                            merchant
                        );
                        merchant.editTransactions(transaction, data.ingredientUpdates);
                        banner.createNotification("NEW TRANSACTION CREATED, INGREDIENTS UPDATED ACCORDINGLY");
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

module.exports = newTransaction;
},{}],15:[function(require,module,exports){
let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTime").innerText = order.date.toLocaleTimeString("en-US");

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        let grandTotal = 0;
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            let price = (order.ingredients[i].quantity * order.ingredients[i].price) / 100;
            grandTotal += price;

            let ingredient = order.ingredients[i].ingredient;
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[1].innerText = `${ingredient.convert(order.ingredients[i].quantity).toFixed(2)} ${ingredient.unit.toUpperCase()}`;
            ingredientDiv.children[2].innerText = `$${(order.ingredients[i].price / 100).toFixed(2)}`;

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

module.exports = orderDetails;
},{}],16:[function(require,module,exports){
let orders = {
    isFetched: false,

    display: async function(Order){
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

                        document.getElementById("orderSubmitForm").onsubmit = ()=>{this.submitFilter(Order)};

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
                totalCost += merchant.orders[i].ingredients[j].price;
            }

            row.children[0].innerText = merchant.orders[i].name;
            row.children[1].innerText = `${merchant.orders[i].ingredients.length} ingredients`;
            row.children[2].innerText = new Date(merchant.orders[i].date).toLocaleDateString("en-US");
            row.children[3].innerText = `$${(totalCost / 100).toFixed(2)}`;
            row.order = merchant.orders[i];
            row.onclick = ()=>{controller.openSidebar("orderDetails", merchant.orders[i])};
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
                        let orderDiv = template.cloneNode(true);
                        let order = new Order(
                            response[i]._id,
                            response[i].name,
                            response[i].date,
                            response[i].ingredients,
                            merchant
                        );

                        let cost = 0;
                        for(let j = 0; j < order.ingredients.length; j++){
                            cost += (order.ingredients[j].price / 100) * order.ingredients[j].quantity;
                        }

                        orderDiv.children[0].innerText = order.name;
                        orderDiv.children[1].innerText = `${order.ingredients.length} items`;
                        orderDiv.children[2].innerText = order.date.toLocaleDateString();
                        orderDiv.children[3].innerText = `$${cost.toFixed(2)}`;
                        orderDiv.onclick = ()=>{controller.openSidebar("orderDetails", order)};
                        orderList.appendChild(orderDiv);
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

module.exports = orders;
},{}],17:[function(require,module,exports){
let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(Recipe){
        if(!this.isPopulated){
            this.populateRecipes();

            if(merchant.pos !== "none"){
                document.getElementById("posUpdateRecipe").onclick = ()=>{this.posUpdate(Recipe)};
            }
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};
            document.getElementById("recipeClearButton").onclick = ()=>{this.clearSorting()};

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
            recipeDiv.onclick = ()=>{controller.openSidebar("recipeDetails", merchant.recipes[i])};
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

    posUpdate: function(Recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        let url = `/recipe/update/${merchant.pos}`;

        fetch(url, {
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

module.exports = recipeBook;
},{}],18:[function(require,module,exports){
let recipeDetails = {
    recipe: {},

    display: function(recipe){
        this.recipe = recipe;

        document.getElementById("recipeName").style.display = "block";
        document.getElementById("recipeNameIn").style.display = "none";
        document.querySelector("#recipeDetails h1").innerText = recipe.name;

        let ingredientList = document.getElementById("recipeIngredientList");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            ingredientDiv = template.cloneNode(true);

            ingredientDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `${recipe.ingredients[i].ingredient.convert(recipe.ingredients[i].quantity).toFixed(2)} ${recipe.ingredients[i].ingredient.unit}`;
            ingredientDiv.ingredient = recipe.ingredients[i].ingredient;
            ingredientDiv.name = recipe.ingredients[i].ingredient.name;

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("addRecIng").style.display = "none";

        let price = document.getElementById("recipePrice");
        price.children[1].style.display = "block";
        price.children[2].style.display = "none";
        price.children[1].innerText = `$${(recipe.price / 100).toFixed(2)}`;

        document.getElementById("recipeUpdate").style.display = "none";

        document.getElementById("editRecipeBtn").onclick = ()=>{this.edit()};
        if(merchant.pos === "none"){
            document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove()};
        }
        document.getElementById("addRecIng").onclick = ()=>{this.displayAddIngredient()};
        document.getElementById("recipeUpdate").onclick = ()=>{this.update()};
    },

    edit: function(){
        let ingredientDivs = document.getElementById("recipeIngredientList");

        if(merchant.pos === "none"){
            let name = document.getElementById("recipeName");
            let nameIn = document.getElementById("recipeNameIn");
            name.style.display = "none";
            nameIn.style.display = "block";
            nameIn.value = this.recipe.name;

            let price = document.getElementById("recipePrice");
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

        document.getElementById("addRecIng").style.display = "flex";
        document.getElementById("recipeUpdate").style.display = "flex";
    },

    update: function(){
        this.recipe.name = document.getElementById("recipeNameIn").value || this.recipe.name;
        this.recipe.price = Math.round((document.getElementById("recipePrice").children[2].value * 100)) || this.recipe.price;
        this.recipe.ingredients = [];

        let divs = document.getElementById("recipeIngredientList").children;
        for(let i = 0; i < divs.length; i++){
            if(divs[i].name === "new"){
                let select = divs[i].children[0];
                this.recipe.ingredients.push({
                    ingredient: select.options[select.selectedIndex].ingredient,
                    quantity: controller.convertToMain(select.options[select.selectedIndex].ingredient.unit, divs[i].children[1].value)
                });
            }else{
                this.recipe.ingredients.push({
                    ingredient: divs[i].ingredient,
                    quantity: controller.convertToMain(divs[i].ingredient.unit, divs[i].children[1].value)
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
                    window.merchant.editRecipes([this.recipe]);
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
        let template = document.getElementById("addRecIngredient").content.children[0].cloneNode(true);
        template.name = "new";
        document.getElementById("recipeIngredientList").appendChild(template);

        let categories = window.merchant.categorizeIngredients();

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

module.exports = recipeDetails;
},{}],19:[function(require,module,exports){
let transactionDetails = {
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

        if(merchant.pos === "none"){
            document.getElementById("removeTransBtn").onclick = ()=>{this.remove()};
        }
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

module.exports = transactionDetails;
},{}],20:[function(require,module,exports){
let transactions = {
    isPopulated: false,

    display: function(Transaction){
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

                transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
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

            document.getElementById("transFormSubmit").onsubmit = ()=>{this.submitFilter(Transaction)};

            this.isPopulated = true;
        }
    },

    submitFilter: function(Transaction){
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
                        transactionDiv.onclick = ()=>{controller.openSidebar("transactionDetails", transaction)};
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

module.exports = transactions;
},{}]},{},[7]);
