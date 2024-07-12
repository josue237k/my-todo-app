//jshint esversion:6

//for development version
// if(process.env.NODE_ENV !== "production"){
//     
// }

//require all our packets
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const mongoDB = require("mongodb");
const md5 = require("md5");
const flash = require("connect-flash");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { type } = require("os");


//initialise all the necceseray packets
app.use(express.static(path.join(__dirname, "")));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/views")))
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "kimmich",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session());
app.use(flash());
app.use(passport.authenticate('session'));

//connection to database
mongoose.connect("mongodb://127.0.0.1:27017/todoAppDB")
    .then(console.log("succesfully connected to database"))
    .catch(err => console.log(err));
//task schema and model
const taskschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);
const task = mongoose.model("tasks", taskschema);
//user schema and model


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    spotifyId: String
},
    { timestamps: true }
);

//initialise pas the different plugins
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const user = mongoose.model("users", userSchema);

//create strategy to serialize or deserialize users
passport.use(user.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user.id);
    });
})
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


// passport.deserializeUser(function (user, done) {
//     done(null, user);
// });
//implement the google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/main"
},
    async function (accessToken, refreshToken, profile, cb) {
        await user.findOrCreate({ googleId: profile.id, }, function (err, user) {
            return cb(err, user);
        });
    }
));
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/main',
    passport.authenticate('google', { failureRedirect: '/home' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/main.html');
    });
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/spotify/main"
},
    function (accessToken, refreshToken, profile, cb) {
        user.findOrCreate({ spotifyId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));
app.get('/auth/spotify', passport.authenticate('spotify'));

app.get(
    '/auth/spotify/main',
    passport.authenticate('spotify', { failureRedirect: '/home' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/main.html');
    }
)

//building of the REST API

//All the get routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.get("/payment", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "payment.html"));
});
app.get("/auth/google", (req, res) => {
    passport.authenticate("google", { scope: ["profile"] })
})
app.get("/auth/spotify", (req, res) => {
    passport.authenticate("spotify", { scope: ["profile"] })
})
app.get("/main", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "views", "main.html"));
    } else {
        res.redirect("/home.html");
    }

});
app.get("/main.html", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "views", "main.html"));
    } else {
        res.redirect("/home.html");
    }

});


//all the post routes
app.post("/register", (req, res) => {
    user.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            res.redirect("/register.html")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/views/main.html")
            })
        }
    })
});
app.post("/", (req, res) => {
    const myUser = new user({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(myUser, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/views/main.html")
            })
        }
    })
    req.session.userId = user._id;
})

app.post("/main", async (req, res) => {
    try {
        const post = new task({
            content: req.body.content,
            userId: req.user._id
        })
        await post.save();
        res.send("task saved");
    } catch (error) {
        console.log(error);
    }
})
app.get("/logout", async (req, res) => {
    req.logout(err => {
        if (err) {
            console.log(err);
        } {
            res.redirect("/");
        }
    });
})



//port to listen either 3000 in development or custom port in production
app.listen(process.env.PORT || 3000, () => {
    console.log("App listenig on port 3000");
});
