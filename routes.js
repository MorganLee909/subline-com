const renderer = require("./controllers/renderer");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");
const otherData = require("./controllers/otherData");
const transactionData = require("./controllers/transactionData");
const recipeData = require("./controllers/recipeData");

module.exports = function(app){
    //Render page
    app.get("/", renderer.landingPage);
    app.get("/inventory", renderer.displayInventory);
    app.get("/recipes", renderer.displayRecipes);
    app.get("/information", renderer.displayLegal);
    app.get("/data", renderer.displayData);

    //Merchant
    app.post("/merchant/create/none", merchantData.createMerchantNone);
    app.get("/merchant/create/clover", merchantData.createMerchantClover);
    app.get("/merchant/recipes/update", merchantData.updateRecipes);
    app.post("/merchant/ingredients/create", merchantData.addMerchantIngredient);
    app.post("/merchant/ingredients/remove", merchantData.removeMerchantIngredient);
    app.post("/merchant/ingredients/update", merchantData.updateMerchantIngredient);
    app.post("/merchant/recipes/ingredients/create", merchantData.addRecipeIngredient);
    app.post("/merchant/recipes/ingredients/update", merchantData.updateRecipeIngredient);
    app.post("/merchant/recipes/ingredients/remove", merchantData.removeRecipeIngredient);
    app.post("/merchant/update", merchantData.updateMerchant);
    app.post("/merchant/password", merchantData.updatePassword);

    //Ingredients
    app.get("/ingredients", ingredientData.getIngredients);
    app.post("/ingredients/createone", ingredientData.createIngredient);  //also adds to merchant

    //Recipes
    app.post("/recipe/create", recipeData.createRecipe);

    //Other
    
    app.post("/purchases/create", otherData.createPurchase);
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.get("/clover", otherData.clover);
    app.get("/cloverlogin", otherData.cloverRedirect);
    app.get("/cloverauth*", otherData.cloverAuth);

    //Transactions
    app.get("/transactions", transactionData.getTransactions);
    app.get("/purchases", transactionData.getPurchases);
    app.post("/transactions/create", transactionData.createTransaction);  //Creates transaction for non-pos merchant
}