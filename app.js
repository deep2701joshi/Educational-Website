const express=require("express");
const bodyparser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/college_web");
const session=require("express-session");
const app=express();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
   secret:"helloworldthisisdeepjoshiandyouarehello",
   resave:false,
   saveUninitialized: false
}));
const Schema_login=new mongoose.Schema({
    Name:String,
    email:String,
    num:Number,
    password:String
})
const Schema_course=new mongoose.Schema({
    title:String,
    price:Number,
    des:String
});
const model_course=mongoose.model("course",Schema_course);
const model_login=mongoose.model("reg_log",Schema_login);

const arr=[]

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.username ? true : false;
    next();
  });
app.get("/",(req,res)=>{
        res.render("index",{ex: req.session.username});
    
});
app.get("/profile", (req, res) => {
    // Check if session is set
    if (req.session && req.session.username) {
        // Pass session data to the template
        res.render("profile", { username: req.session.username });
    }else{
        res.render("profile",{ username : null});
    }
});
app.get("/logout", (req, res) => {
    if (req.session && req.session.username) {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            } else {
                res.redirect("/");
            }
        });
    } else {
        res.redirect("/");
    }
});


app.get("/index",(req,res)=>{
    res.redirect("/");
});
app.get("/about",(req,res)=>{
    res.render("about");
})
app.get("/blog",(req,res)=>{
    res.render("blog");
})
app.get("/contact",(req,res)=>{
    res.render("contact");
})
app.get("/course-inner", (req, res) => {
    // Retrieve the course title from the query parameters
    const courseTitle = req.query.i;

    // Fetch the course details from your database based on the courseTitle
    // For demonstration purposes, let's assume you have a function called getCourseByTitle
    // that retrieves the course details from the database
    model_course.findOne({ title: courseTitle })
        .then((result) => {
            console.log("res is" + result);
            res.render("course-inner", { ex: result });
        })
        .catch(err => {
            console.log(err);
            res.send("Error fetching course details");
        });
});


app.get("/courses", (req, res) => {
    model_course.find()
        .then((courses) => {
            console.log(courses);
            res.render("courses", { ex: courses });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});

app.get("/post",(req,res)=>{
    res.render("post");
})
app.get("/cart",(req,res)=>{
    const t=req.query.title;
    const p=req.query.price;
    if(t==0 && p== 0){
        res.redirect("login");
    }else{
    arr.push({title:t,price:p});
    console.log(arr);
    res.render("cart",{items:arr});}
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/pay",(req,res)=>{
    res.render("pay");
});
app.get("/register",(req,res)=>{
    res.render("register");
})
app.post("/register",(req,res)=>{
    const ele1=new model_login({
        Name:req.body.name,
        num:req.body.Number,
        email:req.body.email,
        password:req.body.password
    })
    ele1.save()
        .then(()=>{res.redirect("login")})
        .catch(err=>{console.log(err)});
});
app.post("/login",(req,res)=>{
    let uname=req.body.email;
    let pass=req.body.password;
    model_login.findOne({email:uname})
        .then((result)=>{
            if(result.password!=pass){
                console.log("actual is "+result.password+" enterd "+pass);
                console.log("inCorrect");
                res.redirect("login");
            }else{
                req.session.username=uname;
                req.session.name=result.Name;
                console.log(req.session.name);
                console.log("Correct");
                res.redirect("index");
            }
        })
        .catch(err=>{
            console.log(err)
            res.redirect("login");
            });

});
app.get("/inc_course",(req,res)=>{
    res.render("inc_course");
});
app.post("/include", (req, res) => {
    console.log(req.body.title);
    const ele1 = new model_course({ // Use model_course to save course data
      title: req.body.title,
      price: req.body.price,
      des: req.body.des
    });
  
    ele1.save()
      .then(() => {
        res.redirect("inc_course");
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  });

/*app.post("/cart",(req,res)=>{
    const item=req.query.i;
    arr.push(item);
    res.redirect("/cart");
})*/

app.listen(3000,function(){
console.log("Server Started");
}
);