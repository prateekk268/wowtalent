const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require("./src/route/route")
require('dotenv').config()


app.use(express.json())
app.use(express.urlencoded({extended:true}))


const DBConnection = async () => {
    // const MONGO_URI = "mongodb+srv://prateek:cvKx4jrPzfgmmbUT@mern.483njbl.mongodb.net/?retryWrites=true&w=majority"; 
    const Data = process.env.MONGO_URI;
    // console.log(Data.toString())
    try {
        await mongoose.connect(Data,{dbName: "wowalent", useNewUrlParser: true});
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error while connecting with the database ", error);
    }
}
DBConnection()


app.use('/', route);

app.all('*', function (req, res) {
    return res.status(404).send("Welcome, look like you hit the wrong Api");
});



app.listen(process.env.PORT || 5000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 5000))
});