const home = require("./controllers/home");

module.exports = function(app){
    //Render page
    app.get("/", home.displayInventory);
    app.get("/merchant/new", home.merchantSetup);
    app.get("/recipes", home.displayRecipes);

    //Merchant
    app.get("/merchant/recipes/update", home.updateRecipes);
    app.post("/merchant/create", home.createMerchant);
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

    //Clover API
    app.get("/getrecipes", home.getCloverRecipes);
}