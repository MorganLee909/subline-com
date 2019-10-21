const home = require("./controllers/home");

module.exports = function(app){
    app.get("/", home.displayInventory);
    app.get("/merchant/new", home.merchantSetup);
    app.get("/getrecipes", home.getCloverRecipes);
    app.post("/merchant/create", home.createMerchant);
    app.post("/merchant/update", home.updateMerchant);
    app.post("/ingredients/create", home.createNewIngredients);  //update?
    app.post("/ingredients/createone", home.createIngredient);  //update?
    app.get("/recipes", home.displayRecipes);
    app.post("/recipes/ingredients/remove", home.deleteRecipeIngredient);  //update?
    app.get("/recipes/update", home.updateRecipes);
}