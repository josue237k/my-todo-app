//jshint esversion:6
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");
const mongoose=require("mongoose");
const mongoDB=require("mongodb");
const md5=require("md5");
const flash=require("connect-flash");
const app=express();
const path=require("path");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


app.use(express.static(path.join(__dirname,"")));
app.use(express.json());
app.use(express.static(path.join(__dirname,"views")))
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
        secret:"kimmich",
        resave:false,
        saveUninitialized:false
        }));
        app.use(passport.initialize())
        app.use(passport.session());
app.use(flash());
app.use(passport.authenticate('session'));
    
mongoose.connect("mongodb://127.0.0.1:27017/todoAppDB")
    .then(console.log("succesfully connected to database"))
    .catch(err => console.log(err));

const taskschema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    }
},
{timestamps:true}
);
const task=mongoose.model("tasks",taskschema);

const userSchema=new mongoose.Schema({
    email:String,
    password:String,
},
{timestamps:true}
);
userSchema.plugin(passportLocalMongoose)
const user=mongoose.model("users",userSchema);


passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"views","home.html"));
});
app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname,"views","register.html"));
});
app.get("/payment",(req,res)=>{
    res.sendFile(path.join(__dirname,"views","payment.html"));
});
app.get("/main",(req,res)=>{
    if(req.isAuthenticated()){
        res.sendFile(path.join(__dirname,"views","main.html"));
    }else{
        res.redirect("/home.html");
    }
    
});
app.post("/register", (req,res)=>{
    user.register({ username: req.body.username },req.body.password,function(err,user){
        if(err){
            console.log(err)
            res.redirect("/register.html")
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/views/main.html")
            })
        }
    }) 
});
app.post("/",(req,res)=>{
    const myUser=new user({
        username:req.body.username,
        password:req.body.password
    });
    req.logIn(myUser,(err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/views/main.html")
            })
        }
    })
    // try {
    //     const myUser={
    //         email:req.body.email,
    //         password:req.body.password
    //     }
    //     const foundUser=await user.findOne({email:myUser.email});
    //     if(!foundUser){
    //         req.flash("error_msg","no user found");
    //         return;
    //     }else{
    //         if(foundUser){
    //             if(foundUser.password===myUser.password){
    //                 res.redirect("/main.html");
    //             }
    //             else{
    //                 req.flash("error_msg","password does not match try again");
    //                 return;
    //             }
    //         }
    //     }
    // } catch (error) {
    //     console.log(error);
    // }
})
app.get("/delete",(req,res)=>{
    user.delete({});
})






app.listen(process.env.PORT || 3000,()=>{
    console.log("App listenig on port 3000");
});
    // const {email, password}=req.body;
    // const existingUser=await user.findOne({email:email});
    // if(existingUser){
    //     req.flash("error_msg","email deja prit");
    //     res.redirect("/home.html");
    // }
    // try {
    //     const myUser=new user({
    //         email:req.body.email,
    //         password:req.body.password
    //     });
    //     await myUser.save();
    //     req.flash("success_msg","successfuly created your account");
    //     res.redirect("/main.html");
    // } catch (error) {
    //     console.log(error);
    // }
