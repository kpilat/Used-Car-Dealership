require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const paramModify = require(__dirname + "/scripts/paramModify");
const queries = require(__dirname + "/scripts/queries")

// Uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
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

app.get('/results', function(req, res) {

    const conditions = queries.PrepareForSearch(filterParams);

    queries.Car.find(conditions
        , {__v: 0}, function(err, foundCars){
        if (err){
            console.log(err)
        } else {
            let fifteenCars = [];
            let sortedCars = [];
            let len = foundCars.length - 1;
            foundCars.forEach(function(car){
                fifteenCars.push(car);
                if(fifteenCars.length === 15 || car === foundCars[len]){
                    sortedCars.push(fifteenCars);
                    fifteenCars = [];
                }
            })

            res.render('results', {carList: sortedCars[0]});
        }
    }).sort({price: 1});
});

app.get('/results/ad:id', function(req, res) {

    const adID = req.params.id;

    queries.Car.findOne({_id: adID}, function(err, foundCar){
        if(!err){
            res.render("ad", {foundCar: foundCar});
        } else {
            console.log(err);
        }
    })
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

app.post('/',function(req, res){

    filterParams = req.body.brandInput;
    res.redirect("/results");
})

