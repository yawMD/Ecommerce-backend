const {mongoose} = require('mongoose')


const cartSchema = new mongoose.Schema({
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
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    }
},{
    timestamps: true,
})

const cart = mongoose.model('cart',cartSchema)

module.exports = cart
