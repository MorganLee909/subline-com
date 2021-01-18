const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");

const app = express();

mongoose.connect(`${process.env.DB}/inventory-management`, {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/views"));
let httpsServer = {};
if(process.env.NODE_ENV === "production"){
    httpsServer = https.createServer({
        key: fs.readFileSync("/etc/letencrypt/live/www.thesubline.com/privkey.pem", "utf8"),
        cert: fs.readFileSync("/etc/letsencrypt/live/www.leemorgan.io/fullchain.pem", "utf8")
    }, app);

    app.use((req, res, next)=>{
        if(req.secure === true){
            next();
        }else{
            res.redirect(`https://${req.headers.host}${req.url}`);
        }
    });
}

app.use((req, res, next)=>{
    console.log(req.session);
    next();
});
app.use(compression());
app.use(session({
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen",
    cookie: {secure: true},
    saveUninitialized: true,
    resave: false
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

require("./routes")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT, ()=>{});
}

app.listen(process.env.PORT, ()=>{});