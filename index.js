const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require("./src/route/route")



app.use(express.json())
app.use(express.urlencoded({extended:true}))


const DBConnection = async () => {
    const MONGO_URI = "mongodb+srv://prateek:cvKx4jrPzfgmmbUT@mern.483njbl.mongodb.net/?retryWrites=true&w=majority"; 
    try {
        await mongoose.connect(MONGO_URI,{dbName: "wowalent", useNewUrlParser: true});
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error while connecting with the database ", error.message);
    }
}
DBConnection()


app.use('/', route)

app.all('*', function (req, res) {
    throw new Error("You Hit Wrong Api!!!, Plz Check !!!");
});

app.use(function (e, req, res, next) {
    if (e.message === "You Hit Wrong Api!!!, Plz Check !!!") {
       throw new Error(message);
    }
});

app.listen(process.env.PORT || 5000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 5000))
});