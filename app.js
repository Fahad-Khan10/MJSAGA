require("dotenv").config(); 
//make passwords secure by adding it in .env files (npm i dotenv)

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { application } = require("express");
const _ = require("lodash");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_KEY}@cluster0.gv3eye4.mongodb.net/dailyJournalDB?retryWrites=true&w=majority`);

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

const homeContent =
  "Whether sharing your expertise, breaking news, or whatever’s on your mind, you’re in good company on our website MJ Saga. Begin a journey to discover why millions of people have published their passions here.";
const aboutContent =
  "Since 1999, millions of people have expressed themselves on our website MJ Saga. From detailed posts about almost every apple variety you could ever imagine to a blog dedicated to the art of blogging itself, the ability to easily share, publish and express oneself on the web is at the core of Blogger’s mission. As the web constantly evolves, we want to ensure anyone using MJ Saga has an easy and intuitive experience publishing their content to the web.";
const contactContent =
  "It looks like you’re trying to reach MJSaga’s customer service team. To make your life a little easier, please get in contact with MJSaga’s representatives by reaching out to them directly using the contact :: E-Mail Id : MJSaga@gmail.com";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// const posts = [];

//Making Mongoose Schema and model

const composeSchema = new mongoose.Schema({

  title:String,
  text:String,
  likesCount:Number,
  createdOn:String,

});


const composeItem = mongoose.model("composeItem",composeSchema);
const hotItem = mongoose.model("hotItem",composeSchema);












app.get("/", function (req, res) {

    res.sendFile(__dirname + "/MJSaga.html");

});


/// Hot Topics


app.get("/hot", function (req, res) {

  //returns array
  hotItem.find({},function(err,resultArray){

    res.render("hot", {
      homeContent_ejs: homeContent,
      posts: resultArray,
      //sending result array to home for iterting through loop to get title and text
    });

  });

});






app.get("/home", function (req, res) {

  //returns array
  composeItem.find({},function(err,resultArray){

    res.render("home", {
      homeContent_ejs: homeContent,
      posts: resultArray,
      //sending result array to home for iterting through loop to get title and text
    });

  });

});










// Url Responses
app.get("/posts/:post_param", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.post_param);

  composeItem.find({},function(err,resultArray){

    resultArray.forEach(function (result) {
      const storedTitle = _.lowerCase(result.title);
      if (requestedTitle === storedTitle) {
        // console.log(result.likesCount);
  
        res.render("post", {
          title: result.title,
          text: result.text,
          likesCount:result.likesCount,
          date:result.createdOn,
        });
      }
    });
  });
});


////// Likes /////
var isLiked = false;
app.post("/handleLikeButtons",function(req,res){
  
  composeItem.find({ title:req.body.Title },function(err,resultArray){
    // console.log(resultArray[0].likesCount);
    if(!isLiked){
      resultArray[0].likesCount ++ ;
      resultArray[0].save();
      isLiked = true;
    }

    else{
      if( resultArray[0].likesCount !== 0 ){
        resultArray[0].likesCount -- ;
        resultArray[0].save();
        isLiked=false;
      }
     
    }

  });

  res.redirect("/posts/"+req.body.Title);

});













//Compose Page Submission POST
app.post("/home", function (req, res) {

  //Date Code
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = monthNames[today.getMonth()];
  let yyyy = today.getFullYear();
  today = dd + ' ' + mm + ' ' + yyyy;
  console.log(today);

  const compose_obj = new composeItem({
    title: req.body.compose_title,
    text: req.body.compose_text,
    likesCount:0,
    createdOn:today,
  });
  console.log(compose_obj.likesCount);

  //if save successful then redirect to home
  compose_obj.save(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/home");
    }
  });

});















// ABOUT PAGE
app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent_ejs: aboutContent,
  });
});


// CONTACT PAGE
app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent_ejs: contactContent,
  });
});


// COMPOSE PAGE
app.get("/compose", function (req, res) {
  res.render("compose");
});


//Listen Section
const PORT = process.env.PORT ;
app.listen(PORT, function () {
  console.log(`Server On ${PORT}`);
});



