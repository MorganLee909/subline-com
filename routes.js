const home = require("./controllers/home");
const render = require("./controllers/render");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");

module.exports = function(app){
    //Render page
    app.get("/", render.landingPage);
    app.get("/inventory", render.displayInventory);
    app.get("/merchant/new/clover", render.merchantSetupClover);
    app.get("/merchant/new/none", render.merchantSetupNone);
    app.get("/recipes", render.displayRecipes);

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

    //Transactions
    app.post("/transactions/create", home.createTransaction);

    //Clover API
    app.get("/getrecipes", home.getCloverRecipes);

    //Other
    app.get("/unregistered", home.unregistered);
    app.post("/login", home.login);
    app.get("/logout", home.logout);
}