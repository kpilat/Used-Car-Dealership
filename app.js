require('dotenv').config();
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const app = express();
const Models = require(__dirname + "/models/models");
const paramModify = require(__dirname + "/scripts/paramModify");
const queries = require(__dirname + "/scripts/queries")

//********************************//
//************* Uses *************//
//********************************//

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

const mongooseConnectOptions = {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true};
const connection = mongoose.connect(process.env.MONGO_URL, mongooseConnectOptions);


//********************************//
//************* Variables ********//
//********************************//

let selectedBrand = [];
let filterParams;


//********************************//
//************* Sessions *************//
//********************************//

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


//********************************//
//******** Strategies ************//
//********************************//

passport.use(new LocalStrategy({usernameField: "email"},function (email, password, done) {

    Models.User.findOne({ email: email }, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: 'Incorrect password.' });

            return done(null, user);
        });
    });
}));


//********************************//
//*********  Serializers *********//
//********************************//

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Models.User.findById(id, function(err, user) {
        done(err, user);
    });
});


//********************************//
//*********  Functions *********//
//********************************//


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}


//********************************//
//************ ROOT **************//
//********************************//

app.route("/")

    .get(function(req, res) {

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
                            recover: (req.query.recover) ? req.session.filterParams : "",
                            user: (req.user) ? req.user : "false"
                        });
                    } else {
                        console.log(err);
                    }
                })
            } else {
                console.log(err);
            }
        });
    })
    .post(function(req, res){

        if(!req.session.sort && !req.session.count){
            req.session.sort = req.query.sort;
            req.session.count = req.query.count;
        }

        req.session.filterParams = req.body.brandInput;
        res.redirect("/results");
    });

//********************************//
//*********** Results ************//
//********************************//

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
                    pagination: pagination,
                    user: (req.user) ? req.user : "false"
                });
            }
        }).sort(sortBy);
});

app.get('/results/ad:id', function(req, res) {

    const adID = req.params.id;

    Models.Car.findOne({_id: adID}, function(err, foundCar){
        if(!err){
            res.render("ad", {
                foundCar: foundCar,
                user: (req.user) ? req.user : "false"
            });
        } else {
            console.log(err);
        }
    })
});


//********************************//
//*********** Register ***********//
//********************************//

app.route('/register')

    .get(function(req, res) {
    res.render("register", {user: (req.user) ? req.user : "false"});
    })

    .post(async function(req, res, next){

        const exists = await Models.User.exists({ email: req.body.email });

        if (exists) {
            res.redirect('/login');
            return;
        }

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) return next(err);

                const newUser = new Models.User({
                    email: req.body.email,
                    password: hash,
                    username: req.body.username,
                    phone: req.body.phone,
                    town: req.body.town
                });
                newUser.save();
                res.redirect("/login");
            });
        });

    });


//********************************//
//************* Login ************//
//********************************//

app.route('/login')

    .get(function(req, res) {
    res.render("login", {user: (req.user) ? req.user : "false"});
    })

    .post(function(req, res, next){


        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        })(req, res, next);
    });


//********************************//
//************ Logout ************//
//********************************//

app.get('/logout', function(req, res){
    req.logout();
    res.redirect("/");
});


//********************************//
//************ Create ************//
//********************************//

app.route('/create')


    .get(function(req, res) {
    if (req.isAuthenticated()) {
        Models.BrandAndModel.find({},{brand: 1, models: 1, _id: 0}, function(err, foundItems){
            if(!err){
                Models.Parameter.find({}, {vehicleType: 1, gearbox: 1, fuelType: 1, _id: 0}, function(err2, foundParams){
                    if(!err2){
                        res.render('create', {
                            brandsAndModels: JSON.stringify(foundItems),
                            vehicleType: foundParams[0].vehicleType,
                            gearbox: foundParams[0].gearbox,
                            fuelType: foundParams[0].fuelType,
                            years: paramModify.fillYear(),
                            recover: (req.query.recover) ? req.session.filterParams : "",
                            user: (req.user) ? req.user : "false"
                        });
                    } else {
                        console.log(err);
                    }
                })
            } else {
                console.log(err);
            }
        });
    } else {
        res.redirect("/login");
    }
    })
    .post(function(req, res){

        if (req.isAuthenticated()) {
            const vehicleData = JSON.parse(req.body.brandInput);

            const newVehicle = new Models.Car({
                price: vehicleData.price,
                vehicleType: vehicleData.vehicleType,
                gearbox: vehicleData.gearbox,
                powerPS: vehicleData.powerPS,
                model: vehicleData.model,
                kilometer: vehicleData.kilometer,
                fuelType: vehicleData.fuelType,
                brand: vehicleData.brand,
                firstRegistration: vehicleData.firstRegistration
            });



            newVehicle.save(function(err){
                if(err){
                    console.log(err);
                } else {
                    Models.User.updateOne(
                        { _id: req.user._id },
                        { $push: { ads: newVehicle._id } },
                        function (err) {
                            if(err){
                                console.log(err);
                            } else {
                                res.redirect("/");
                            }
                        }
                    );
                }
            });
        } else {
            res.redirect("/login");
        }



        //Get user id and put id of new ad to DB under user
        //Create user profile where own ads can be checked

    });

app.route("/profile")

    .get(function (req, res) {

        if (req.isAuthenticated() && req.query.id === (req.user._id).toString()) {
            console.log(req.query.id);
            res.render("profile",{
                user: (req.user) ? req.user : "false"
            });
        } else {
            res.redirect("/login");
        }
    });


app.route("/userads")

    .get(function (req, res) {
        if (req.isAuthenticated() && req.query.id === (req.user._id).toString()) {

            Models.Car.find({
                '_id': { $in: req.user.ads}
            }, function(err, foundCars){
                if(err) {
                    console.log(err);
                } else {
                    res.render("userads",{
                        user: (req.user) ? req.user : "false",
                        carList: foundCars
                    });
                }
            });


        } else {
            res.redirect("/login");
        }
    });




app.listen(3000, function() {
    console.log("Server started on port 3000");
});


