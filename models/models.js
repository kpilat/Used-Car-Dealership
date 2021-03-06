const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

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

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    phone: String,
    town: String,
    ads: [String]
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    reports: [Object]
});

userSchema.plugin(passportLocalMongoose);
adminSchema.plugin(passportLocalMongoose);

const Car = mongoose.model("Car", carSchema);
const BrandAndModel = mongoose.model("BrandsAndModel", brandsAndModelsSchema);
const Parameter = mongoose.model("Parameter", parametersSchema);
const User = new mongoose.model("User", userSchema);
const Admin = new mongoose.model("Admin", adminSchema);

module.exports = {Car, BrandAndModel, Parameter, User, Admin};





