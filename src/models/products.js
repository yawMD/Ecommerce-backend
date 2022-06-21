const {mongoose, model} = require('mongoose')
const validator = require("validator")
require("./users")


const foodSchema = new mongoose.Schema({
    products:{
        type: String,
        required:true,
        trim: true,
        validator(value){
            if(validator.isDecimal(value)) {
                throw new Error("task shouldn't be numbers")
            }
        }
    },
    categories: {
        type:Array,
    },
    price:{
        type: Number,
        required: true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    image:{
        type: String,
        default:"image"
    },
},{
    timestamps: true,
})

const products = mongoose.model('products',foodSchema)

module.exports = products
