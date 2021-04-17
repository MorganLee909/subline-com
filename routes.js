const renderer = require("./controllers/renderer");
const merchantData = require("./controllers/merchantData");
const ingredientData = require("./controllers/ingredientData");
const otherData = require("./controllers/otherData");
const transactionData = require("./controllers/transactionData");
const recipeData = require("./controllers/recipeData");
const orderData = require("./controllers/orderData.js");
const informationPages = require("./controllers/informationPages.js");
const emailVerification = require("./controllers/emailVerification.js");
const passwordReset = require("./controllers/passwordReset.js");
const squareData = require("./controllers/squareData.js");

const session = require("./middleware.js").verifySession;
const banner = require("./middleware.js").formatBanner;

const upload = require("multer")({dest: "uploads/"});

module.exports = function(app){
    //Render page
    app.get("/", banner, renderer.landingPage);
    app.get("/login", banner, renderer.loginPage);
    app.get("/register", banner, renderer.registerPage);
    app.get("/dashboard", session, renderer.displayDashboard);
    app.get("/resetpassword/*", renderer.displayPassReset);
    
    //Merchant
    app.get("/merchant/:id", merchantData.getMerchant);
    app.post("/merchant/create/none", merchantData.createMerchantNone);
    app.post("/merchant/add/none", session, merchantData.addMerchantNone);
    app.put("/merchant/ingredients/update", session, merchantData.updateIngredientQuantities); //also updates some data in ingredients
    app.post("/merchant/password", merchantData.updatePassword); //TODO: change to work with session
    app.put("/merchant/update", session, merchantData.updateData);
    app.put("/merchant/password", session, merchantData.changePassword);
    app.delete("/merchant", session, merchantData.deleteMerchant);

    //Ingredients
    app.post("/ingredients/create", session, ingredientData.createIngredient);  //also adds to merchant
    app.put("/ingredients/update", session, ingredientData.updateIngredient);
    app.post("/ingredients/create/spreadsheet", session, upload.single("ingredients"), ingredientData.createFromSpreadsheet);
    app.get("/ingredients/download/spreadsheet", session, ingredientData.spreadsheetTemplate);
    app.delete("/ingredients/remove/:id", session, ingredientData.removeIngredient);

    //Recipes
    app.post("/recipe/create", session, recipeData.createRecipe);
    app.put("/recipe/update", session, recipeData.updateRecipe);
    app.delete("/recipe/remove/:id", session, recipeData.removeRecipe);
    app.post("/recipes/create/spreadsheet", session, upload.single("recipes"), recipeData.createFromSpreadsheet);
    app.get("/recipes/download/spreadsheet", session, recipeData.spreadsheetTemplate);

    //Orders
    app.post("/orders/get", session, orderData.getOrders);
    app.post("/order/create", session, orderData.createOrder);
    app.post("/orders/create/spreadsheet", session, upload.single("orders"), orderData.createFromSpreadsheet);
    app.get("/orders/download/spreadsheet", session, orderData.spreadsheetTemplate);
    app.delete("/order/:id", session, orderData.removeOrder);

    //Transactions
    app.post("/transaction", session, transactionData.getTransactions);
    app.post("/transaction/create", session, transactionData.createTransaction);
    app.post("/transactions/create/spreadsheet", session, upload.single("transactions"), transactionData.createFromSpreadsheet);
    app.get("/transactions/download/spreadsheet", session, transactionData.spreadsheetTemplate);
    app.delete("/transaction/:id", session, transactionData.remove);
    app.get("/populatesometransactions", session, transactionData.populate);

    //Other
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.post("/feedback", session, otherData.feedback);
    app.get("/session/end", session, otherData.endSession);
    
    //Information Pages
    app.get("/privacy", informationPages.privacy);
    app.get("/terms", informationPages.terms);
    app.get("/help", informationPages.help);

    //Email verification
    app.get("/verify/email/:id", banner, emailVerification.sendVerifyEmail);
    app.post("/verify/resend", emailVerification.resendEmail);
    app.get("/verify/:id/:code", emailVerification.verify);

    //Password reset
    app.get("/reset/email", passwordReset.enterEmail);
    app.post("/reset/email", passwordReset.generateCode);
    app.get("/reset/:id/:code", banner, passwordReset.enterPassword);
    app.post("/reset", passwordReset.resetPassword);

    //Square
    app.post("/squarelogin", squareData.redirect);
    app.get("/squareauth", squareData.createMerchant);
    app.get("/recipes/update/square", session, squareData.updateRecipes);
    app.get("/square/locations", session, squareData.getLocations);
    app.get("/square/add/:location", session, squareData.addMerchant);
}