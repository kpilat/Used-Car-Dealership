const mongoose = require("mongoose");

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


function PrepareForSearch(packedFilterParams){

    const filterParams = JSON.parse(packedFilterParams)

    console.log("After unpack: " + filterParams.brand);

    return Clean(filterParams);
    // const newFilterParams = {
    //     brand: filterParams.brand,
    //     model: filterParams.model,
    //     firstRegistration: "{ $gt : " + filterParams.yearFrom + ", $lt : " + filterParams.yearTo + " }",
    //     fuelType: filterParams.fuel,
    //     kilometer: "{ $gt : " + filterParams.kmFrom + ", $lt : " + filterParams.kmTo + " }",
    //     vehicleType: filterParams.vehicleType,
    //     gearbox: filterParams.gearbox,
    //     powerPS: "{ $gt : " + filterParams.powerFrom + ", $lt : " + filterParams.powerTo + " }",
    //     price: "{ $gt : " + filterParams.priceFrom + ", $lt : " + filterParams.priceTo + " }"
    // }

    //const cleanedParams = Clean(newFilterParams);
    // return cleanedParams;
}

function Clean(obj){

    // console.log("Before Clean: " + obj);
    //
    // if(obj.firstRegistration === "{ $gt : undefined, $lt : undefined }" || Object.keys(obj.firstRegistration).length === 2){
    //     delete obj.firstRegistration;
    // }
    // if(obj.kilometer === "{ $gt : undefined, $lt : undefined }" || Object.keys(obj.kilometer).length === 2){
    //     delete obj.kilometer;
    // }
    // if(obj.powerPS === "{ $gt : undefined, $lt : undefined }" || Object.keys(obj.powerPS).length === 2){
    //     delete obj.powerPS;
    // }
    // if(obj.price === "{ $gt : undefined, $lt : undefined }" || Object.keys(obj.price).length === 2){
    //     delete obj.price;
    // }
    // //delete obj.price;

    if(obj.model === "model"){
        delete obj.model;
    }
    return obj;
}

module.exports = {PrepareForSearch, Car, BrandAndModel, Parameter};