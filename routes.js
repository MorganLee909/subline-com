const home = require("./controllers/home");

module.exports = function(app){
    app.get("/", home.displayInventory);
    app.get("/merchant/new", home.merchantSetup);
}