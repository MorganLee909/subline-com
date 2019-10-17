const home = require("./controllers/home");

module.exports = function(app){
    app.get("/", home.displayInventory);
    app.get("/merchant/new", home.merchantSetup);
    app.get("/getrecipes", home.getRecipes);
    app.post("/merchant/create", home.createMerchant);
    app.post("/merchant/update", home.updateMerchant);
    app.post("/ingredients/create", home.createNewIngredients);
    app.post("/ingredients/createone", home.createIngredient);
    app.get("/recipes", home.displayRecipes);
    app.post("/recipes/ingredients/remove", home.deleteRecipeIngredient);
}