const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");

const app = express();

mongoose.connect(`${process.env.DB}/inventory-management`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.set("view engine", "ejs");

let sessionOptions = {
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen. Simply Superb.",
    secure: true,
    sameSite: "strict",
    saveUninitialized: true,
    resave: false,
}

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
}

app.use(compression());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session(sessionOptions));
require("./routes")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT, ()=>{});
}

app.listen(process.env.PORT, ()=>{});