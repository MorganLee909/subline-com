const home = require("./strands/home.js");
const ingredients = require("./strands/ingredients.js");
const recipeBook = require("./strands/recipeBook.js");
const analytics = require("./strands/analytics.js");
const orders = require("./strands/orders.js");
const transactions = require("./strands/transactions.js");
const account = require("./strands/account.js");

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

const modalScript = require("./modal.js");

const Merchant = require("./classes/Merchant.js");
window.merchant = new Merchant(
    data.merchant.name,
    data.merchant.pos,
    data.merchant.inventory,
    data.merchant.recipes,
    data.transactions,
    (data.merchant.address === undefined) ? "" : data.merchant.address.full,
    data.owner,
    data.merchant._id
);

controller = {
    openStrand: function(strand, data){
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
                recipeBook.display();
                break;
            case "analytics":
                activeButton = document.getElementById("analyticsBtn");
                document.getElementById("analyticsStrand").style.display = "flex";
                analytics.display();
                break;
            case "orders":
                activeButton = document.getElementById("ordersBtn");
                document.getElementById("ordersStrand").style.display = "flex";
                orders.display();
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                if(data !== undefined) transactions.transactions = data;
                transactions.display();
                break;
            case "account":
                activeButton = document.getElementById("accountBtn");
                document.getElementById("accountStrand").style.display = "flex";
                account.display();
                break;
        }

        activeButton.classList = "menuButton active";
        activeButton.disabled = true;

        if(screen.height > screen.width || screen.width < 1200){
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
            case "newIngredient":
                newIngredient.display();
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
                newRecipe.display();
                break;
            case "orderDetails":
                orderDetails.display(data);
                break;
            case "orderFilter":
                orderFilter.display();
                break;
            case "newOrder":
                newOrder.display();
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "transactionFilter":
                transactionFilter.display();
                break;
            case "newTransaction":
                newTransaction.display();
                break;
        }

        if(screen.height > screen.width || screen.width < 1200){
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

        if(screen.height > screen.width || screen.width < 1200){
            document.querySelector(".contentBlock").style.display = "flex";
            document.getElementById("mobileMenuSelector").style.display = "block";
            document.getElementById("sidebarCloser").style.display = "none";
        }
    },

    openModal: function(str, data){
        let modal = document.getElementById("modal");
        modal.style.display = "flex";
        modal.onclick = ()=>{this.closeModal()};
        document.querySelector(".modalBox").onclick = ()=>{event.stopPropagation()};
        document.getElementById("modalClose").addEventListener("click", this.closeModal);
        let content = {};

        switch(str){
            case "ingredientSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "ingredients";
                document.getElementById("spreadsheetDownload").href = "/ingredients/download/spreadsheet";
                content.onsubmit = newIngredient.submitSpreadsheet;
                break;
            case "recipeSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "recipes";
                document.getElementById("spreadsheetDownload").href = "/recipes/download/spreadsheet";
                content.onsubmit = newRecipe.submitSpreadsheet;
                break;
            case "orderSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "orders";
                document.getElementById("spreadsheetDownload").href = "/orders/download/spreadsheet";
                content.onsubmit = newOrder.submitSpreadsheet;
                break;
            case "transactionSpreadsheet":
                content = document.getElementById("modalSpreadsheetUpload");
                content.style.display = "flex";
                document.getElementById("modalSpreadsheetTitle").innerText = "transactions";
                document.getElementById("spreadsheetDownload").href = "/transactions/download/spreadsheet";
                content.onsubmit = newTransaction.submitSpreadsheet;
                break;
            case "feedback":
                modalScript.feedback();
                break;
            case "newMerchant":
                modalScript.newMerchant();
                break;
            case "confirmDeleteMerchant":
                content = document.getElementById("modalConfirm");
                content.style.display = "flex";
                content.children[1].innerText = "Are you sure you want to delete this merchant?";
                content.children[2].children[0].onclick = ()=>{controller.closeModal()};
                content.children[2].children[1].onclick = ()=>{account.deleteMerchant()};
                break;
            case "confirmDeleteIngredient":
                content = document.getElementById("modalConfirm");
                content.style.display = "flex";
                content.children[1].innerText = `Are you sure you want to delete ingredient: ${data.ingredient.name}?`;
                content.children[2].children[0].onclick = ()=>{controller.closeModal()};
                content.children[2].children[1].onclick = ()=>{ingredientDetails.remove(data)};
                break;
            case "confirmDeleteRecipe":
                content = document.getElementById("modalConfirm");
                content.style.display = "flex";
                content.children[1].innerText = `Are you sure you want to delete recipe: ${data.name}?`;
                content.children[2].children[0].onclick = ()=>{controller.closeModal()};
                content.children[2].children[1].onclick = ()=>{recipeDetails.remove(data)};
                break;
            case "confirmDeleteOrder":
                content = document.getElementById("modalConfirm");
                content.style.display = "flex";
                content.children[1].innerText = `Are you sure you want to delete order: ${data.name}`;
                content.children[2].children[0].onclick = ()=>{controller.closeModal()};
                content.children[2].children[1].onclick = ()=>{orderDetails.remove(data)};
                break;
            case "confirmDeleteTransaction":
                content = document.getElementById("modalConfirm");
                content.style.display = "flex";
                content.children[1].innerText = `Are you sure you want to delete this transaction?`;
                content.children[2].children[0].onclick = ()=>{controller.closeModal()};
                content.children[2].children[1].onclick = ()=>{transactionDetails.remove(data)};
                break;
            case "squareLocations":
                modalScript.squareLocations(data);
                break;
            case "editSubIngredients":
                modalScript.editSubIngredients(data);
                break;
            case "circularReference":
                modalScript.circularReference(data);
                break;
        }
    },

    closeModal: function(){
        let modal = document.getElementById("modal");
        let modalContent = document.getElementById("modalContent");

        for(let i = 0; i < modalContent.children.length; i++){
            modalContent.children[i].style.display = "none";
        }

        modal.style.display = "none";
    },

    createBanner: function(text, status){
        let container = document.getElementById("bannerContainer");
        let template = document.getElementById("banner").content.children[0];
        let banner = template.cloneNode(true);

        switch(status){
            case "error":
                banner.children[0].style.backgroundColor = "rgb(200, 0, 0)";
                banner.children[0].children[0].style.display = "block";
                break;
            case "alert":
                banner.children[0].style.backgroundColor = "rgb(230, 210, 0)";
                banner.children[0].children[1].style.display = "block";
                break;
            case "success":
                banner.children[0].style.backgroundColor = "rgb(0, 145, 55)";
                banner.children[0].children[2].style.display = "block";
                break;
        }

        banner.children[1].innerText = text;
        container.appendChild(banner);

        let timer = setTimeout(()=>{
            container.removeChild(banner);
        }, 10000);

        banner.children[2].addEventListener("click", ()=>{
            container.removeChild(banner);
            clearTimeout(timer);
        });
    },

    changeMenu: function(){
        let menu = document.querySelector(".menu");
        let buttons = document.querySelectorAll(".menuButton");
        let links = document.getElementById("menuLinks");
        let merchantName = document.getElementById("menuLocationName");

        if(!menu.classList.contains("menuMinimized")){
            merchantName.style.display = "none";
            menu.classList = "menu menuMinimized";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "none";
            }

            document.getElementById("max").style.display = "none";
            document.getElementById("min").style.display = "flex";
            
            links.children[0].style.fontSize = "12px";
            links.children[1].style.display = "none";
            
        }else if(menu.classList.contains("menuMinimized")){
            merchantName.style.display = "block";
            menu.classList = "menu";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "block";
            }

            document.getElementById("max").style.display = "flex";
            document.getElementById("min").style.display = "none";

            links.children[0].style.fontSize = "16px";
            links.children[1].style.display = "block";

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

    //TOREMOVE
    baseUnit(quantity, unit){
        switch(unit){
            case "g": return quantity;
            case "kg": return quantity * 1000;
            case "oz":  return quantity * 28.3495; 
            case "lb":  return quantity * 453.5924;
            case "ml": return quantity / 1000; 
            case "l": return quantity;
            case "tsp": return quantity / 202.8842; 
            case "tbsp": return quantity / 67.6278; 
            case "ozfl": return quantity / 33.8141; 
            case "cup": return quantity / 4.1667; 
            case "pt": return quantity / 2.1134; 
            case "qt": return quantity / 1.0567; 
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000; 
            case "cm": return quantity / 100; 
            case "m": return quantity;
            case "in": return quantity / 39.3701; 
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    },

    //TOREMOVE
    displayUnit(quantity, unit){
        switch(unit){
            case "g": return quantity;
            case "kg": return quantity / 1000;
            case "oz":  return quantity / 28.3495; 
            case "lb":  return quantity / 453.5924;
            case "ml": return quantity * 1000; 
            case "l": return quantity;
            case "tsp": return quantity * 202.8842; 
            case "tbsp": return quantity * 67.6278; 
            case "ozfl": return quantity * 33.8141; 
            case "cup": return quantity * 4.1667; 
            case "pt": return quantity * 2.1134; 
            case "qt": return quantity * 1.0567; 
            case "gal": return quantity / 3.7854;
            case "mm": return quantity * 1000; 
            case "cm": return quantity * 100; 
            case "m": return quantity;
            case "in": return quantity * 39.3701; 
            case "ft": return quantity * 3.2808;
            default: return quantity;
        }
    },

    getUnitType(unit){
        switch(unit){
            case "g": return "mass";
            case "kg": return "mass";
            case "oz": return "mass";
            case "lb": return "mass";
            case "l": return "volume";
            case "ml": return "volume";
            case "tsp": return "volume";
            case "tbsp": return "volume";
            case "ozfl": return "volume";
            case "cup": return "volume";
            case "pt": return "volume";
            case "qt": return "volume";
            case "gal": return "volume";
            case "mm": return "length";
            case "cm": return "length";
            case "m": return "length";
            case "in": return "length";
            case "ft": return "length";
            case "bottle": return "bottle";
            case "each": return "each";
        }
    },

    getBaseUnit(unit){
        switch(unit){
            case "g": return "g";
            case "kg": return "g";
            case "oz": return "g";
            case "lb": return "g";
            case "l": return "l";
            case "ml": return "l";
            case "tsp": return "l";
            case "tbsp": return "l";
            case "ozfl": return "l";
            case "cup": return "l";
            case "pt": return "l";
            case "qt": return "l";
            case "gal": return "l";
            case "mm": return "m";
            case "cm": return "m";
            case "m": return "m";
            case "in": return "m";
            case "ft": return "m";
            case "bottle": return "l";
        }
    },

    unitMultiplier(from, to){
        let multiplier = 1;
        
        switch(from){
            case "kg": multiplier = 1000; break;
            case "oz": multiplier = 28.3495; break;
            case "lb": multiplier = 453.5924; break;
            case "ml": multiplier = .001; break;
            case "tsp": multiplier = .00492892004404; break;
            case "tbsp": multiplier = 0.0147868184386; break;
            case "ozfl": multiplier = 0.0295734619582; break;
            case "cup": multiplier = 0.239998080015; break;
            case "pt": multiplier = 0.473171193338; break;
            case "qt": multiplier = 0.946342386675; break;
            case "gal": multiplier = 3.7854; break;
            case "mm": multiplier = 0.001; break;
            case "cm": multiplier = 0.01; break;
            case "in": multiplier = 0.025399986284; break;
            case "ft": multiplier = 0.304803706413; break;
        }

        switch(to){
            case "g": return multiplier;
            case "kg": return multiplier / 1000;
            case "oz": return multiplier / 28.3495;
            case "lb": return multiplier / 453.5924;
            case "ml": return multiplier * 1000;
            case "l": return multiplier;
            case "tsp": return multiplier * 202.8842;
            case "tbsp": return multiplier * 67.6278;
            case "cup": return multiplier * 4.1667;
            case "pt": return multiplier * 2.1134;
            case "qt": return multiplier * 1.0567
            case "gal": return multiplier / 3.7854;
            case "mm": return multiplier * 1000;
            case "cm": return multiplier * 100;
            case "m": return multiplier;
            case "in": return multiplier * 39.3701;
            case "ft": return multiplier * 3.2808;
        }

        return multiplier;
    },

    /*
    Applies unitMultiplier to a specific quantity and unit
    quantity = quantity of ingredient
    unit = unit of ingredient
    */
    toBase: function(quantity, unit){
        return quantity * this.unitMultiplier(unit, this.getBaseUnit(unit));
    }
}

window.state = {
    updateIngredients: function(){
        ingredients.populateByProperty();
        analytics.isPopulated = false;
        home.drawInventoryCheckCard();
        home.mostUsedIngredients();
        home.mostUsedRecipes();
    },

    updateRecipes: function(){
        recipeBook.populateRecipes();
        analytics.isPopulated = false;
        home.mostUsedIngredients();
        home.mostUsedRecipes();
    },

    updateTransactions: function(transaction){
        home.isPopulated = false;
        ingredients.populateByProperty();
        analytics.isPopulated = false;
        transactions.display();
        home.mostUsedRecipes();
        home.mostUsedIngredients();
    },

    updateOrders: function(newOrders){
        ingredients.isPopulated = false;
        orders.isPopulated = false;
        home.mostUsedIngredients();
        if(newOrders !== undefined) orders.orders = newOrders;
    },

    updateMerchant(){
        this.updateIngredients();
        this.updateRecipes();
        this.updateTransactions();
        this.updateOrders();
        document.getElementById("menuLocationName").innerText = merchant.name;
        recipeBook.isPopulated = false;
    }
}

let from = new Date();
from.setDate(from.getDate() - 7);
from.setHours(0, 0, 0, 0);

//Add click listeners for menu buttons
document.getElementById("menuShifter").onclick = ()=>{controller.changeMenu()}
document.getElementById("menuShifter2").onclick = ()=>{controller.changeMenu()}
document.getElementById("homeBtn").onclick = ()=>{controller.openStrand("home")};
document.getElementById("ingredientsBtn").onclick = ()=>{controller.openStrand("ingredients")};
document.getElementById("recipeBookBtn").onclick = ()=>{controller.openStrand("recipeBook")};
document.getElementById("analyticsBtn").onclick = ()=>{controller.openStrand("analytics")};
document.getElementById("ordersBtn").onclick = ()=>{controller.openStrand("orders")};
document.getElementById("transactionsBtn").onclick = ()=>{controller.openStrand("transactions")};
document.getElementById("accountBtn").onclick = ()=>{controller.openStrand("account")};
document.getElementById("feedbackButton").onclick = ()=>{controller.openModal("feedback")};

document.getElementById("menuLocationName").innerText = merchant.name;

controller.openStrand("home");

for(let i = 0; i < merchant.recipes.length; i++){
    merchant.recipes[i].calculateIngredientTotals();
}