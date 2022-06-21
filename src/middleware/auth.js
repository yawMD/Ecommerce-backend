const User = require('../models/users.js')
const Product = require('../models/products.js')
const jwt = require('jsonwebtoken')



const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, 'thisismynewcourse')
        console.log('decoded',decoded)
        const user = await User.findOne({_id:decoded._id,'tokens.token':token})
        const product = await Product.findOne({_id:decoded._id,'tokens.token':token})
        console.log(product)

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        req.product = product
        next()

    }catch (e){
        console.log(e)
        res.status(401).send({error:"please authenticate"})
    }
}

const verifyToken = (req,res,next)=>{
    auth(req,res,()=> {
        if(req.user._id === req.params._id || req.user.isAdmin) {
            next();
        }else{
            res.status(403).json("you are not authorized")
        }
    })
}

module.exports = {
    auth,
    verifyToken
}