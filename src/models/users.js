//mongodb ORM.....mongoose

const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const product = require("./products")
const {string} = require("sharp/lib/is");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validator(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    age: {
        type: Number,
        validate(value){
            if(value<0){
                throw new Error("Age entered must be positive")
            }
        }
    },
    image:{
        type: String
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: String
    },
},{
    timestamps: true,
})
//

userSchema.virtual("product", {
    ref:"products",
    localField:"_id",
    foreignField:"owner"
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString(),isAdmin: user.isAdmin},'thisismynewcourse')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await  User.findOne({ email })

    if(!user){
        throw new Error("unable to login")
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login")
    }
    return user
}

userSchema.pre("save", async function(next){
    const user = this

    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Delete user tasks when user is removed

userSchema.pre('remove', async function(next){
    const user = this
    await product.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User