const controller = require("./Controllers/Controller");

module.exports = function(app){
    app.get("/ingredients", controller.getIngredients);
    app.post("/ingredients", controller.createIngredient);
}