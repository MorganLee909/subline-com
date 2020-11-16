const home = require("./strands/home.js");
const ingredients = require("./strands/ingredients.js");
const recipeBook = require("./strands/recipeBook.js");
const analytics = require("./strands/analytics2.js");
const orders = require("./strands/orders.js");
const transactions = require("./strands/transactions.js");

const ingredientDetails = require("./sidebars/ingredientDetails.js");
const newIngredient = require("./sidebars/newIngredient.js");
const editIngredient = require("./sidebars/editIngredient.js");
const newOrder = require("./sidebars/newOrder.js");
const newRecipe = require("./sidebars/newRecipe.js");
const editRecipe = require("./sidebars/editRecipe.js");
const newTransaction = require("./sidebars/newTransaction.js");
const orderDetails = require("./sidebars/orderDetails.js");
const orderFilter = require("./sidebars/orderFilter.js");
const recipeDetails = require("./sidebars/recipeDetails.js");
const transactionDetails = require("./sidebars/transactionDetails.js");
const transactionFilter = require("./sidebars/transactionFilter.js");

const Merchant = require("./classes/Merchant.js");
const Ingredient = require("./classes/Ingredient.js");
const Recipe = require("./classes/Recipe.js");
const Order = require("./classes/Order.js");
const Transaction = require("./classes/Transaction.js");

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
    openStrand: function(strand, data = undefined){
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
                orders.orders = data;
                orders.display(Order);
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                transactions.transactions = data;
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
                ingredientDetails.display(data, ingredients);
                break;
            case "newIngredient":
                newIngredient.display(Ingredient);
                break;
            case "editIngredient":
                editIngredient.display(data);
                break;
            case "recipeDetails":
                recipeDetails.display(data);
                break;
            case "editRecipe":
                editRecipe.display(data);
                break;
            case "addRecipe":
                newRecipe.display(Recipe);
                break;
            case "orderDetails":
                orderDetails.display(data);
                break;
            case "orderFilter":
                orderFilter.display(Order);
                break;
            case "newOrder":
                newOrder.display(Order);
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "transactionFilter":
                transactionFilter.display();
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
            if(sidebar.children[i].style.display !== "none"){
                sidebar.children[i].style.display = "none";
                let choosables = [];

                switch(sidebar.children[i].id){
                    case "ingredientDetails": 
                        choosables = document.querySelectorAll(".ingredient");
                        break;
                    case "transactionDetails":
                        choosables = document.getElementById("transactionsList").children;
                        break;
                    case "recipeDetails":
                        choosables = document.getElementById("recipeList").children;
                        break;
                    case "orderDetails":
                        choosables = document.getElementById("orderList").children;
                        break;
                }

                for(let i = 0; i < choosables.length; i++){
                    choosables[i].classList.remove("active");
                }
            }

            
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
//Add click listeners for menu buttons
document.getElementById("homeBtn").onclick = ()=>{controller.openStrand("home")};
document.getElementById("ingredientsBtn").onclick = ()=>{controller.openStrand("ingredients")};
document.getElementById("recipeBookBtn").onclick = ()=>{controller.openStrand("recipeBook")};
document.getElementById("analyticsBtn").onclick = ()=>{controller.openStrand("analytics")};
document.getElementById("ordersBtn").onclick = async ()=>{
    if(merchant.orders.length === 0){
        merchant.setOrders(await orders.getOrders(Order));
    }
    controller.openStrand("orders", merchant.orders);
}
document.getElementById("transactionsBtn").onclick = ()=>{controller.openStrand("transactions", merchant.getTransactions())};

controller.openStrand("home");