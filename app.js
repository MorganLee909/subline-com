const express = require("express");
const session = require("cookie-session");
const mongoose = require("mongoose");
const compression = require("compression");
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
    dbName: "subline"
};

let sessionOptions = {
    secret: process.env.SESSION_SECRET,
    sameSite: "lax",
    saveUninitialized: true,
    resave: false,
};

let cssOptions = {
    recursive: true,
    miminize: false
};

let esbuildOptions = {
    entryPoints: [`${__dirname}/views/dashboardPage/js/dashboard.js`],
    bundle: true,
    minify: false,
    outfile: `${__dirname}/views/dashboardPage/bundle.js`
};

app.set('views', `${__dirname}/views`);
app.use(express.static(`${__dirname}/views`));
if(process.env.NODE_ENV === "production"){
    sessionOptions.secure = true;
    cssOptions.minimize = true;
    mongooseOptions.auth = {authSource: "admin"};
    mongooseOptions.user = "subline";
    mongooseOptions.pass = process.env.SUBLINE_DB_PASS;
    esbuildOptions.minify = true;
}

mongoose.connect(`mongodb://127.0.0.1:27017/subline`, mongooseOptions);

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
    `${__dirname}/views/shared/css/general.css`,
    `${__dirname}/views/shared/css/loader.css`,
    `${__dirname}/views/shared/css/banner.css`,
    `${__dirname}/views/dashboardPage/css`
], `${__dirname}/views/dashboardPage/bundle.css`, cssOptions);

if(process.env.NODE_ENV === "production"){
    module.exports = app;
}else{
    app.listen(process.env.PORT, ()=>{});
}
