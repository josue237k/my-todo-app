
//require all our packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const mongodb = require('mongodb')



//initialise all the necceseray packages
app.use(express.static(path.join(__dirname, "")));
app.use(express.static(path.join(__dirname, "views")))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "kimmich",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session());
app.use(passport.authenticate('session'));


//connection to database
mongoose.connect(process.env.MONGODB_ATLAS_STRING)
    .then(console.log("succesfully connected to database"))
    .catch(err => console.log(err));


//task schema and model
const taskschema = new mongoose.Schema({
    content: {
        type: String,
        require: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
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
    spotifyId: String,
},
    { timestamps: true }
);

//initialise the different plugins
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


app.get("/tasks", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const tasks = await task.find({ userId: req.user });
            res.render('tasks', { tasks })
        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect("/home.html")
    }
});

//when the user log out of his session
app.get("/logout", async (req, res) => {
    req.logout(err => {
        if (err) {
            console.log(err);
        } {
            res.redirect("/");
        }
    });
})

//les delete routes
app.delete('/tasks/:id', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const taskId = req.params.id;
            await task.findByIdAndDelete(taskId);
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(403).json({ message: 'Unauthorized' });
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
app.post("/register.html", (req, res) => {
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
                res.redirect("/main.html");
            })
        }
    })
})

app.post("/main.html", async (req, res,) => {
    try {
        const myowntask = req.body.mdcontent;
        const myuserId = req.user;
        const mytask = new task({
            userId: myuserId,
            content: myowntask
        });
        console.log(mytask);
        await mytask.save();
        res.redirect("/main.html")
    } catch (error) {
        console.log(error);
    }

})




//port to listen either 3000 in development or custom port in production
app.listen(process.env.PORT || 3000, () => {
    console.log("App listenig on port 3000");
});
