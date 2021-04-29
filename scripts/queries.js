const mongoose = require("mongoose");
const paramModify = require("../scripts/paramModify");

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


function PrepareForSearch(packedFilterParams) {

    const filterParams = JSON.parse(packedFilterParams)

    let readyParams = Clean(filterParams);

    const conditions = {
        brand: readyParams.brand,
        model: (readyParams.model) ? readyParams.model : /.*/,
        kilometer: {
            $gt: (readyParams.kmFrom) ? readyParams.kmFrom : 0,
            $lt: (readyParams.kmTo) ? readyParams.kmTo : 1000000
        },
        firstRegistration: {
            $gt: (readyParams.yearFrom) ? readyParams.yearFrom : 1970,
            $lt: (readyParams.yearTo) ? readyParams.yearTo : paramModify.getYear()
        },
        powerPS: {
            $gt: (readyParams.powerFrom) ? readyParams.powerFrom : 0,
            $lt: (readyParams.powerTo) ? readyParams.powerTo : 15000
        },
        price: {
            $gt: (readyParams.priceFrom) ? readyParams.priceFrom : 0,
            $lt: (readyParams.priceTo) ? readyParams.priceTo : 100000000
        },
        fuelType: (readyParams.fuel) ? readyParams.fuel : /.*/,
        vehicleType: (readyParams.vehicleType) ? readyParams.vehicleType : /.*/,
        gearbox: (readyParams.gearbox) ? readyParams.gearbox : /.*/,

    };

    return conditions;
}

function Clean(obj){

    if(obj.model === "model"){
        delete obj.model;
    }
    return obj;
}

function SortBy(input){
    let output = "";
    const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('')

    const sortBy = [
        {
            name: "pricea",
            value: {price: 1}
        },
        {
            name: "priced",
            value: {price: -1}
        }
    ];

    sortBy.forEach(function(item){
        if(item.name === input){
            output = item.value;
        }
    });

    return output;
}

module.exports = {PrepareForSearch, Car, BrandAndModel, Parameter, SortBy};