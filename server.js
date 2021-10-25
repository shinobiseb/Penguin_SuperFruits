/////////////////////////////////
// IMPORT DEPENDANCIES
////////////////////////////////

require("dotenv").config() // brings in .env vars
const express = require("express") // web framework
const morgan = require("morgan") // logger
const methodOverride = require("method-override") // to swap request methods
const mongoose = require("mongoose") // our database library
const path = require("path") // helper functions for file paths


//////////////////////////////////
//ESTABLISH DATABASE CONNECTION
//////////////////////////////////
// setup the inputs for mongoose connect
const DATABASE_URL = process.env.DATABASE_URL // url from .env
const CONFIG = {  // CONFIG will stop deprecation warnings
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Connect to Mongo  //  CONFIG will stop deprecation warnings
mongoose.connect(DATABASE_URL, CONFIG)

//our connection messages
mongoose.connection
.on("open", () => console.log("Connected to Mongo"))
.on("close", () => console.log("disconnected from mongo"))
.on("error", (error) => console.log(error))


////////////////////////////////////
// CREATE OUR FRUITS MODEL
////////////////////////////////////
//destructuring Schema and model from mongoose
// const Schema = mongoose.Schema
//const model = mongoose.Model
const {Schema, model} = mongoose // destructured version of above variables

//make a fruits schema // new = constructor
const fruitSchema = new Schema({
    name: String,
    color: String,
    readyToEat: Boolean
})

// make the fruit model - this allows you to use restful routes/ get /find
//models should be uppercase
const Fruit = model("Fruit", fruitSchema)

// log the model to make sure it works // always practice console logging
// console.log(Fruit)

/////////////////////////////////
// CREATE OUR APP WITH OBJECT, CONFIGURE LIQUID
/////////////////////////////////
// import liquid
const liquid = require("liquid-express-views")
// construct an absolute path to our views folder
const viewsFolder = path.resolve(__dirname, "views/")
// log to see the value of the viewsFolder
// console.log(viewsFolder)

// create an app object with liquid, passing the path to the viewsFolder
const app = liquid(express(), {root: viewsFolder})
//console. log app to confirm it exists
// console.log(app)

///////////////////////////////////////
// REGISTER OUR MIDDLEWARE
///////////////////////////////////////
// logging
app.use(morgan("tiny"))
// ability to override request methods
app.use(methodOverride("_method"))
// ability to parse urlencoded from for submission
app.use(express.urlencoded({extended: true}))
// setup our public folder to serve files statically
app.use(express.static("public"))

///////////////////////////////////////
// ROUTES
////////////////////////////////////////
app.get("/", (req, res) => {
    res.send("your server is running.. better catch it")
})

/////////////////////////
// FRUITS ROUTE
//////////////////////////
// SEED ROUTE - seed our starter data
app.get("/fruits/seed", (req, res) => {
    // array of start fruits
    const startFruits = [
        { name: "Orange", color: "orange", readyToEat: false },
        { name: "Grape", color: "purple", readyToEat: false },
        { name: "Banana", color: "orange", readyToEat: false },
        { name: "Strawberry", color: "red", readyToEat: false },
        { name: "Coconut", color: "brown", readyToEat: false },
      ];
      // delete all fruits
    Fruit.deleteMany({})
    .then((data) => {
        // seed starter fruits
        Fruit.create(startFruits)
        .then((data) => {
            res.json(data)
        })
    })
})

//INDEX ROUTE - GET - /fruits
app.get("/fruits", (req, res) => {
    // find all the fruits
    Fruit.find({})
        .then((fruits) => {
            //render the index template with the fruits
            res.render("fruits/index.liquid", {fruits}) // same as {fruits: fruits}
        })
        // error handling
        .catch((error) => {
            res.json({error})
        })
})

// destroy route - delete request - /fruits/:id
app.delete("/fruits/:id", (req, res) => {
    // grab the id from params
    const id = req.params.id
    // delete the fruit
    Fruit.findByIdAndRemove(id)
    .then((fruit) => {
        // redirect user back to index
        res.redirect("/fruits")
    })
     // error handling
     .catch((error) => {
        res.json({error})
    })
})

///////////////////////////////////////
// NEW ROUTE - GET request - "/fruits/new -purpose is to generate a form to add new content
//////////////////////////////////////
app.get("/fruits/new", (req, res) => {
    res.render("fruits/new.liquid")
})

// create - post request - /fruits
app.post("/fruits", (req, res) => {

    // convert the checkbox property to true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false

    // create the new fruit
    Fruit.create(req.body)
    .then((fruit) => {
        // redirect the user back to the index route
        res.redirect("/fruits")
    })
    // error handling
    .catch((error) => {
        res.json({error})
    })

})

// edit route - get request - /fruits/:id/edit
app.get("/fruits/:id/edit", (req, res) => {
    // get the id from params
    const id = req.params.id

    // get the fruit with the matching id
    Fruit.findById(id)
    .then((fruit) => {
        // render the edit page template with the fruit data
        res.render("fruits/edit.liquid", { fruit })
    })
    // error handling
    .catch((error) => {
        res.json({error})
    })
})

// update route - put request - "/fruits/:id"
app.put("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    
    // convert the checkbox property to true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false

    // update the item with the matching id
    Fruit.findByIdAndUpdate(id, req.body, {new: true})
    .then((fruit) => {
        // redirect user back to index
        res.redirect("/fruits")
    })
     // error handling
     .catch((error) => {
        res.json({error})
    })
}
)

// SHOW ROUTE - get - /fruits/:id
app.get("/fruits/:id", (req, res) => {
    //get the id from params
    const id = req.params.id

    // get that particular fruit from the database
    Fruit.findById(id)
    .then((fruit) => {
        // render the show page with said fruit
        res.render("fruits/show.liquid", {fruit})
    })
    // error handling
    .catch((error) => {
        res.json({error})
    })
})


////////////////////////////////////////
// SETUP SERVER LISTENER
///////////////////////////////////////
const PORT = process.env.PORT // grabbing the port number from env
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))