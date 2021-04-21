const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");
const cssmerger = require("cssmerger");

const app = express();

mongoose.connect(`mongodb://subline:${process.env.SUBLINE_DB_PASS}@localhost:27017/inventory-management?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.set("view engine", "ejs");

let sessionOptions = {
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen. Simply Superb.",
    sameSite: "lax",
    saveUninitialized: true,
    resave: false,
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
}

app.use(compression());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session(sessionOptions));
require("./routes")(app);

console.time("time");
cssmerger([
    // "./views/shared/shared.css",
    // "./views/dashboardPage/dashboard.css",
    "./views/dashboardPage/sidebars.css",

    "./views/shared/css/general.css",
    "./views/shared/css/loader.css",
    "./views/dashboardPage/css"
], "./views/dashboardPage/bundle.css");
console.timeEnd("time");

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT, ()=>{});
}

app.listen(process.env.PORT, ()=>{});