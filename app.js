const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");
const cssmerger = require("cssmerger");
const esbuild = require("esbuild");
const fileUpload = require("express-fileupload");

const app = express();

app.set("view engine", "ejs");

let mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    dbName: "inventory-management"
};

let sessionOptions = {
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen. Simply Superb.",
    sameSite: "lax",
    saveUninitialized: true,
    resave: false,
};

let cssOptions = {
    recursive: true,
    miminize: false
};

let esbuildOptions = {
    entryPoints: ["./views/dashboardPage/js/dashboard.js"],
    bundle: true,
    minify: false,
    outfile: "./views/dashboardPage/bundle.js"
};

app.use(express.static(__dirname + "/views"));
let httpsServer = {};
if(process.env.NODE_ENV === "production"){
    httpsServer = https.createServer({
        key: fs.readFileSync("/etc/letsencrypt/live/www.thesubline.com/privkey.pem", "utf8"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.thesubline.com/fullchain.pem", "utf8")
    }, app);

    app.use((req, res, next)=>{
        if(req.secure === true){
            next();
        }else{
            res.redirect(`https://${req.headers.host}${req.url}`);
        }
    });

    sessionOptions.domain = process.env.COOKIE_DOMAIN;
    sessionOptions.secure = true;
    cssOptions.minimize = true;
    mongooseOptions.auth = {authSource: "admin"};
    mongooseOptions.user = "website";
    mongooseOptions.pass = process.env.MONGODB_PASS;
    esbuildOptions.minify = true;
}

mongoose.connect(`mongodb://127.0.0.1:27017/inventory-management`, mongooseOptions);

app.use(compression());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    limits: {fileSize: 1024 * 1024},
    useTempFiles: true
}));
app.use(express.json());
app.use(session(sessionOptions));
require("./routes")(app);

esbuild.buildSync(esbuildOptions);
cssmerger([
    "./views/shared/css/general.css",
    "./views/shared/css/loader.css",
    "./views/shared/css/banner.css",
    "./views/dashboardPage/css"
], "./views/dashboardPage/bundle.css", cssOptions);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT, ()=>{});
}

app.listen(process.env.PORT, ()=>{});