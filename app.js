require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const paramModify = require(__dirname + "/scripts/paramModify");
const queries = require(__dirname + "/scripts/queries")

// Uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

const mongooseConnectOptions = {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true};
const connection = mongoose.connect(process.env.MONGO_URL, mongooseConnectOptions);

// Variables
let selectedBrand = [];
let filterParams;

// Sessions

const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collection: "sessions"
});

app.use(session({
    secret: process.env.MONGO_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
}));

app.use(passport.initialize());
app.use(passport.session());


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});




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
                        years: paramModify.fillYear(),
                        recover: (req.query.recover) ? req.session.filterParams : ""
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

app.get('/login', function(req, res) {
    res.render("login");
});

app.get('/register', function(req, res) {
    res.render("register");
});

app.get('/new-ad', function(req, res) {
    if (req.isAuthenticated()) {
        res.render("new-ad");
    } else {
        res.redirect("/login");
    }
});


app.post('/register', function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            })
        }
    })

});

app.post("/login", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            })
        }
    })
});

app.get('/results', function(req, res) {

    if(req.query.sort && req.query.count)
    {
        req.session.sort = req.query.sort.split(' ').join('');
        req.session.count = req.query.count.split(' ').join('');
    }

    const conditions = queries.PrepareForSearch(req.session.filterParams);
    const resultsPerPage = parseInt(req.session.count);
    let sortBy = queries.SortBy(req.session.sort);



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
                if(fifteenCars.length === resultsPerPage || car === foundCars[len]){
                    sortedCars.push(fifteenCars);
                    fifteenCars = [];
                }
            })


            const currentPage = parseInt((req.query.page) ? req.query.page : 1);

            const pagination = {
                disabledLeft: (currentPage === 1) ? "disabled" : "",
                disabledRight: (currentPage === sortedCars.length) ? "disabled" : "",
                currentPage: currentPage,
                pageNumbers: paramModify.GetPageNumbers(currentPage, sortedCars.length)
            }

            res.render('results', {
                carList: sortedCars[currentPage - 1],
                sort: paramModify.GetResultOptions("sort", req.session.sort),
                count: paramModify.GetResultOptions("count", resultsPerPage),
                pagination: pagination
            });
        }
    }).sort(sortBy);
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

    if(!req.session.sort && !req.session.count){
        req.session.sort = req.query.sort;
        req.session.count = req.query.count;
    }

    req.session.filterParams = req.body.brandInput;
    res.redirect("/results");
})

