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

const multer = require("multer");
const upload = multer({dest: "uploads/"});

module.exports = function(app){
    //Render page
    app.get("/", renderer.landingPage);
    app.get("/dashboard", renderer.displayDashboard);
    app.get("/resetpassword/*", renderer.displayPassReset);

    //Merchant
    app.post("/merchant/create/none", merchantData.createMerchantNone);
    app.get("/merchant/create/clover", merchantData.createMerchantClover);
    app.get("/merchant/create/square", merchantData.createMerchantSquare);
    app.put("/merchant/ingredients/update", merchantData.updateMerchantIngredient); //also updates some data in ingredients
    app.post("/merchant/password", merchantData.updatePassword);

    //Ingredients
    app.post("/ingredients/create", ingredientData.createIngredient);  //also adds to merchant
    app.put("/ingredients/update", ingredientData.updateIngredient);
    app.post("/ingredients/create/spreadsheet", upload.single("ingredients"), ingredientData.createFromSpreadsheet);
    app.get("/ingredients/download/spreadsheet", ingredientData.spreadsheetTemplate);
    app.delete("/ingredients/remove/:id", ingredientData.removeIngredient);
    

    //Recipes
    app.post("/recipe/create", recipeData.createRecipe);
    app.put("/recipe/update", recipeData.updateRecipe);
    app.delete("/recipe/remove/:id", recipeData.removeRecipe);
    app.get("/recipe/update/clover", recipeData.updateRecipesClover);
    app.get("/recipe/update/square", recipeData.updateRecipesSquare);
    app.post("/recipes/create/spreadsheet", upload.single("recipes"), recipeData.createFromSpreadsheet);
    app.get("/recipes/download/spreadsheet", recipeData.spreadsheetTemplate);

    //Orders
    app.post("/orders/get", orderData.getOrders);
    app.post("/order/create", orderData.createOrder);
    app.post("/orders/create/spreadsheet", upload.single("orders"), orderData.createFromSpreadsheet);
    app.get("/orders/download/spreadsheet", orderData.spreadsheetTemplate);
    app.delete("/order/:id", orderData.removeOrder);

    //Transactions
    app.post("/transaction", transactionData.getTransactions);
    app.post("/transaction/create", transactionData.createTransaction);
    app.post("/transactions/create/spreadsheet", upload.single("transactions"), transactionData.createFromSpreadsheet);
    app.get("/transactions/download/spreadsheet", transactionData.spreadsheetTemplate);
    app.delete("/transaction/:id", transactionData.remove);
    app.get("/transactions/:from/:to", transactionData.getTransactionsByDate);
    app.get("/populatesometransactions", transactionData.populate);

    //Other
    app.post("/login", otherData.login);
    app.get("/logout", otherData.logout);
    app.get("/cloverlogin", otherData.cloverRedirect);
    app.get("/squarelogin", otherData.squareRedirect);
    app.get("/cloverauth*", otherData.cloverAuth);
    app.get("/squareauth", otherData.squareAuth);
    app.get("/logo", otherData.logo);

    //Information Pages
    app.get("/privacy", informationPages.privacy);
    app.get("/terms", informationPages.terms);
    app.get("/help", informationPages.help);

    //Email verification
    app.get("/verify/email/:id", emailVerification.sendVerifyEmail);
    app.post("/verify/resend", emailVerification.resendEmail);
    app.get("/verify/:id/:code", emailVerification.verify);

    //Password reset
    app.get("/reset/email", passwordReset.enterEmail);
    app.post("/reset/email", passwordReset.generateCode);
    app.get("/reset/:id/:code", passwordReset.enterPassword);
    app.post("/reset", passwordReset.resetPassword);
}