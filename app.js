require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const outputModifier = require("./scripts/outputModifier");
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

    filterParams = req.body.brandInput;
    console.log(filterParams);
    res.redirect("/results");
})

app.get('/results', function(req, res) {

    const params = queries.PrepareForSearch(filterParams);

    //console.log("Search params: " + searchParams);


    queries.Car.find({brand: params.brand, model: (params.model) ? params.model:/.*/}, {_id: 0, __v: 0}, function(err, foundCars){
        if (err){
            console.log(err)
        } else {
            console.log(foundCars);
            res.send(params);
        }
    })

    // queries.Car.find({brand: "audi", model: null}, {_id: 0, __v: 0}, function(err, foundCars){
    //     if (err){
    //         console.log(err)
    //     } else {
    //         console.log(foundCars);
    //         res.send(searchParams);
    //     }
    // })
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
