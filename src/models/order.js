const {mongoose, model} = require('mongoose')



const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        required:true
    },
    products:[{
        productId:{
            type: String,
        },
        quantity:{
            type: Number,
            default:1
        }}],
    amount:{
        type: Number,
        required:true
    },
    address:{
        type: Object,
        required:true
    },
    status:{
        type: String,
        default:"Pending"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    }
},{
    timestamps: true,
})

const order = mongoose.model('order',orderSchema)

module.exports = order
