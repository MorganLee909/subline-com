const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.SUBLINE, {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs");

app.use(session({
    secret: "Super Secret Subline Subliminally Saving Secrets So Sneaky Snakes Stay Sullen",
    cookie: {secure: false},
    saveUninitialized: true,
    resave: false
}));
app.use(require("sanitize").middleware);
app.use(express.static(__dirname + "/views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

require("./routes")(app);

app.listen(process.env.PORT, ()=>{
    console.log(`Running on port ${process.env.PORT}`);
});