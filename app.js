const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost/InventoryManagement", {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.urlencoded({extended: true}));
app.use(express.json());

require("./routes")(app);

const port = 8000;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});