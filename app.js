require('dotenv').config();
const Models = require(__dirname + "/models/models");
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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
    username: String,
    phone: String,
    ads: Array
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());

passport.use(new LocalStrategy({usernameField: "email"},function (email, password, done) {
    console.log("email: " + email);
    console.log("password: " + password);
    console.log("done: " + done);
    User.findOne({ email: email }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: 'Incorrect password.' });

            return done(null, user);
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}


app.get('/', function(req, res) {


    Models.BrandAndModel.find({},{brand: 1, models: 1, _id: 0}, function(err, foundItems){
        if(!err){
            Models.Parameter.find({}, {vehicleType: 1, gearbox: 1, fuelType: 1, _id: 0}, function(err2, foundParams){
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

app.get('/logout', function(req, res){
    req.logout();
    res.redirect("/");
})

app.get('/register', function(req, res) {
    res.render("register");
});

app.get('/create', function(req, res) {
    if (req.isAuthenticated()) {
        res.render("create");
    } else {
        res.redirect("/login");
    }
});


app.post('/register', async function(req, res, next){

    const exists = await User.exists({ email: req.body.email });

    if (exists) {
        res.redirect('/login');
        return;
    }

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) return next(err);

            const newUser = new User({
                email: req.body.email,
                password: hash
            });

            newUser.save();

            res.redirect("/login");

        });
    });

});

app.post("/login", function(req, res, next){


    passport.authenticate('local', function(err, user, info) {
        console.log(info);
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
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



    Models.Car.find(conditions
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

    Models.Car.findOne({_id: adID}, function(err, foundCar){
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

