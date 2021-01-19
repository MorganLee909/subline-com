const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");
const Merchant = require("./models/merchant.js");
const helper = require("./controllers/helper.js");

let protectedRoutes = [
    "/dashboard",
    "/ingredients/create",
    "/ingredients/update",
    "/ingredients/create/spreadsheet"
];

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

app.use(compression());
app.use(session({
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen. Simply Superb.",
    cookie: {secure: true},
    saveUninitialized: true,
    resave: false
}));
app.use((req, res, next)=>{
    if(protectedRoutes.includes(req.url)){
        if(req.session.user === undefined) {
            req.session.error = "PLEASE LOG IN";
            return res.redirect("/");
        }

        Merchant.findOne({"session.sessionId": req.session.user})
            .then((merchant)=>{
                if(merchant === null){
                    throw "no merchant";
                }

                if(merchant.session.date < new Date()){
                    let newExpiration = new Date();
                    newExpiration.setDate(newExpiration.getDate() + 90);

                    merchant.session.sessionId = helper.generateId(25);
                    merchant.session.date = newExpiration;
                    merchant.save();
                    return res.redirect("/");
                }

                res.locals.merchant = merchant;
                return next();
            })
            .catch((err)=>{
                if(err === "no merchant"){
                    req.session.error = "PLEASE LOG IN";
                    return res.redirect("/");
                }
                return res.json("ERROR: UNABLE TO RETRIEVE DATA");
            });
    }else{
        return next();
    }
});
app.use(express.urlencoded({extended: true}));
app.use(express.json());

require("./routes")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT, ()=>{});
}

app.listen(process.env.PORT, ()=>{});