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

merchant = new Merchant(data.merchant, data.transactions, {
    home: home,
    ingredients: ingredients,
    transactions: transactions,
    recipeBook: recipeBook,
    analytics: analytics,
    orders: orders,
    Ingredient: Ingredient,
    Recipe: Recipe,
    Transaction: Transaction
});

controller = {
    sanitaryString: function(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; j++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    },

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
                analytics.display(Transaction);
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
    // updateData: function(item){
    //     switch(item){
    //         case "ingredient":
    //             home.isPopulated = false;
    //             ingredients.populateByProperty("category");
    //             break;
    //         case "recipe":
    //             transactions.isPopulated = false;
    //             recipeBook.populateRecipes();
    //             break;
    //         case "order":
    //             orders.populate();
    //             break;
    //         case "transaction":
    //             transactions.isPopulated = false;
    //             transactions.display(Transaction);
    //             analytics.newData = true;
    //             break;
    //     }
    // },

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
    // transactionIndices(transactions, from, to = new Date()){
    //     let indices = [];

    //     for(let i = 0; i < transactions.length; i++){
    //         if(transactions[i].date < to){
    //             indices.push(i);
    //             break;
    //         }
    //     }

    //     for(let i = transactions.length - 1; i >= 0; i--){
    //         if(transactions[i].date > from){
    //             indices.push(i);
    //             break;
    //         }
    //     }

    //     if(indices.length < 2){
    //         return false;
    //     }

    //     return indices;
    // },

    /*
    Converts the price of a unit to $/main unit
    unitType = type of the unit (i.e. mass, volume)
    unit = exact unit to convert from
    price = price of the ingredient per unit in cents
    */
    convertPrice(unitType, unit, price){
        if(unitType === "mass"){
            switch(unit){
                case "g": break;
                case "kg": price /= 1000; break;
                case "oz":  price /= 28.3495; break;
                case "lb":  price /= 453.5924; break;
            }
        }else if(unitType === "volume"){
            switch(unit){
                case "ml": price *= 1000; break;
                case "l": break;
                case "tsp": price *= 202.8842; break;
                case "tbsp": price *= 67.6278; break;
                case "ozfl": price *= 33.8141; break;
                case "cup": price *= 4.1667; break;
                case "pt": price *= 2.1134; break;
                case "qt": price *= 1.0567; break;
                case "gal": price /= 3.7854; break;
            }
        }else if(unitType === "length"){
            switch(unit){
                case "mm": price *= 1000; break;
                case "cm": price *= 100; break;
                case "m": break;
                case "in": price *= 39.3701; break;
                case "ft": price *= 3.2808; break;
            }
        }

        return price;
    },

    /*
    Converts the price of unit back to the price per default unit
    unitType = type of the unit (i.e. mass, volume)
    unit = exact unit to convert to
    price = price of the ingredient per unit in cents
    */
    reconvertPrice(unitType, unit, price){
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

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    this.changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}

controller.openStrand("home");