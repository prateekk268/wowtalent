const mongoose = require("mongoose")

const counterSchema = new mongoose.Schema({
    user_id : {type : String},
    seq : {type : Number}
})

module.exports = mongoose.model("counter" , counterSchema)