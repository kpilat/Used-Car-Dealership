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

module.exports = {Car, BrandAndModel, Parameter};