require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const outputModifier = require("./scripts/outputModifier");


// Uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost/usedCarDealershipDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Variables
let selectedBrand = [];

// Database

const carSchema = new mongoose.Schema({
    price: Number,
    vehicleType: String,
    gearbox: String,
    powerPS: Number,
    model: String,
    kilometer: Number,
    fuelType: String,
    brand: String,
    firstRegistration: Number
});

const brandsAndModelsSchema = new mongoose.Schema({
    brand: String,
    models: Array
});

const parametersSchema = new mongoose.Schema({
    vehicleType: Array,
    gearbox: Array,
    fuelType: Array
});

const Car = mongoose.model("Car", carSchema);
const BrandAndModel = mongoose.model("BrandsAndModel", brandsAndModelsSchema);
const Parameter = mongoose.model("Parameter", parametersSchema);



app.get('/', function(req, res) {

    BrandAndModel.find({},{brand: 1, models: 1, _id: 0}, function(err, foundItems){
        if(!err){
            Parameter.find({}, {vehicleType: 1, gearbox: 1, fuelType: 1, _id: 0}, function(err2, foundParams){
                if(!err2){
                    res.render('home', {
                        brandsAndModels: JSON.stringify(foundItems),
                        vehicleType: foundParams[0].vehicleType,
                        gearbox: foundParams[0].gearbox,
                        fuelType: foundParams[0].fuelType,
                        years: outputModifier.fillYear()
                    });
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }
    });

});

app.post('/',function(req, res){

    res.send(req.body.listName);
    //res.redirect("/");
})

app.get('/results', function(req, res) {
    res.send(params);
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
