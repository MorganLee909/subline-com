const renderer = require("./controllers/renderer");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");
const otherData = require("./controllers/otherData");

module.exports = function(app){
    //Render page
    app.get("/", renderer.landingPage);
    app.get("/inventory", renderer.displayInventory);
    app.get("/merchant/new/clover", renderer.merchantSetupClover);
    app.get("/merchant/new/none", renderer.merchantSetupNone);
    app.get("/recipes", renderer.displayRecipes);
    app.get("/legal", renderer.informationPage);

    //Merchant
    app.get("/merchant/recipes/update", merchantData.updateRecipes);
    app.post("/merchant/clover/create", merchantData.createMerchantClover);
    app.post("/merchant/none/create", merchantData.createMerchantNone);
    app.post("/merchant/ingredients/create", merchantData.addMerchantIngredient);
    app.post("/merchant/ingredients/remove", merchantData.removeMerchantIngredient);
    app.post("/merchant/ingredients/update", merchantData.updateMerchantIngredient);
    app.post("/merchant/recipes/ingredients/create", merchantData.addRecipeIngredient);
    app.post("/merchant/recipes/ingredients/update", merchantData.updateRecipeIngredient);
    app.post("/merchant/recipes/ingredients/remove", merchantData.removeRecipeIngredient);

    //Ingredients
    app.get("/ingredients", ingredientData.getIngredients);
    app.post("/ingredients/create", ingredientData.createNewIngredients);
    app.post("/ingredients/createone", ingredientData.createIngredient);  //also adds to merchant

    //Other
    app.post("/transactions/create", otherData.createTransaction);  //Creates transaction for non-pos merchant
    app.post("/purchases/create", otherData.createPurchase);
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.post("/email", otherData.checkUniqueEmail);
    app.get("/cloverlogin", otherData.clover);
    app.get("/cloverauth*", otherData.cloverAuth);
}