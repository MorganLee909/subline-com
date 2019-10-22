const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost/InventoryManagement", {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs");

app.use(session({
    secret: "Super Secret Subline",
    cookie: {secure: false},
    saveUninitialized: true,
    resave: false
}));
app.use(express.static(__dirname + "/views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

require("./routes")(app);

const port = 8000;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});