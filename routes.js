const renderer = require("./controllers/renderer");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");
const otherData = require("./controllers/otherData");
const transactionData = require("./controllers/transactionData");
const recipeData = require("./controllers/recipeData");
const orderData = require("./controllers/orderData.js");

module.exports = function(app){
    //Render page
    app.get("/", renderer.landingPage);
    app.get("/dashboard", renderer.displayDashboard);
    app.get("/information", renderer.displayLegal);
    app.get("/resetpassword/*", renderer.displayPassReset);

    //Merchant
    app.post("/merchant/create/none", merchantData.createMerchantNone);
    app.post("/merchant/create/clover", merchantData.createMerchantClover);
    app.delete("/merchant/recipes/remove/:id", merchantData.removeRecipe);
    app.put("/merchant/ingredients/add", merchantData.addMerchantIngredient);
    app.delete("/merchant/ingredients/remove/:id", merchantData.removeMerchantIngredient);
    app.put("/merchant/ingredients/update", merchantData.updateMerchantIngredient);
    // app.post("/merchant/password", merchantData.updatePassword);

    //Ingredients
    app.get("/ingredients", ingredientData.getIngredients);
    app.post("/ingredients/create", ingredientData.createIngredient);  //also adds to merchant

    //Recipes
    app.post("/recipe/create", recipeData.createRecipe);
    app.put("/recipe/update", recipeData.updateRecipe);

    //Orders
    app.get("/order", orderData.getOrders);
    app.post("/order", orderData.createOrder);

    //Other
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.get("/cloverlogin", otherData.cloverRedirect);
    app.get("/cloverauth*", otherData.cloverAuth);
    app.post("/resetpassword", otherData.resetPassword);

    //Transactions
    app.get("/populatesometransactions", transactionData.populate);
}