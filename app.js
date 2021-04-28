require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const paramModify = require("./scripts/paramModify");
const queries = require("./scripts/queries")

// Uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost/usedCarDealershipDB', {useNewUrlParser: true, useUnifiedTopology: true});

// Variables
let selectedBrand = [];
let filterParams;

// Database









app.get('/', function(req, res) {

    queries.BrandAndModel.find({},{brand: 1, models: 1, _id: 0}, function(err, foundItems){
        if(!err){
            queries.Parameter.find({}, {vehicleType: 1, gearbox: 1, fuelType: 1, _id: 0}, function(err2, foundParams){
                if(!err2){
                    res.render('home', {
                        brandsAndModels: JSON.stringify(foundItems),
                        vehicleType: foundParams[0].vehicleType,
                        gearbox: foundParams[0].gearbox,
                        fuelType: foundParams[0].fuelType,
                        years: paramModify.fillYear()
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

    filterParams = req.body.brandInput;
    res.redirect("/results");
})

app.get('/results', function(req, res) {

    const conditions = queries.PrepareForSearch(filterParams);

    queries.Car.find(conditions
        , {_id: 0, __v: 0}, function(err, foundCars){
        if (err){
            console.log(err)
        } else {
            res.send(foundCars);
        }
    })
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
