const home = require("./controllers/home");
const render = require("./controllers/render");

module.exports = function(app){
    //Render page
    app.get("/", render.landingPage);
    app.get("/inventory", render.displayInventory);
    app.get("/merchant/new/clover", render.merchantSetupClover);
    app.get("/merchant/new/none", render.merchantSetupNone);
    app.get("/recipes", render.displayRecipes);

    //Merchant
    app.get("/merchant/recipes/update", home.updateRecipes);
    app.post("/merchant/clover/create", home.createMerchantClover);
    app.post("/merchant/none/create", home.createMerchantNone);
    app.post("/merchant/ingredients/create", home.addMerchantIngredient);
    app.post("/merchant/ingredients/remove", home.removeMerchantIngredient);
    app.post("/merchant/ingredients/update", home.updateMerchantIngredient);
    app.post("/merchant/recipes/ingredients/create", home.addRecipeIngredient);
    app.post("/merchant/recipes/ingredients/update", home.updateRecipeIngredient);
    app.post("/merchant/recipes/ingredients/remove", home.removeRecipeIngredient);

    //Ingredients
    app.get("/ingredients", home.getIngredients);
    app.post("/ingredients/create", home.createNewIngredients);
    app.post("/ingredients/createone", home.createIngredient);  //also adds to merchant

    //Transactions
    app.post("/transactions/create", home.createTransaction);

    //Clover API
    app.get("/getrecipes", home.getCloverRecipes);

    //Other
    app.get("/unregistered", home.unregistered);
    app.post("/login", home.login);
    app.get("/logout", home.logout);
}