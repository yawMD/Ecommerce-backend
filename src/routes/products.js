const express = require("express")
const products = require("../models/products.js");
const {auth, verifyToken} = require("../middleware/auth.js")
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const router = new express.Router()

router.post("/products",verifyToken, async(req, res)=>{
    // const Task = new task(req.body)
    console.log(req.body)
    const product = new products({
        ...req.body,
        owner: req.user._id
    })

    try{
        console.log(product)
        await product.save()
        res.status(201).send(product)
    }catch (e){
        res.status(404).send(e)
    }
    // Task.save().then(()=>{
    //     res.send(Task)
    // }).catch((error)=>{
    //     res.status(400)
    //     res.send(error)
    // })
})


const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
            cb(new Error("File must be an image"))
        }
        cb(undefined,true)
    }
})




router.post("/products/me/img",auth, upload.single('image'), async(req,res)=> {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()

    const imgpath = `${process.cwd()}/images/img-${new Date().toISOString()}.png`

    fs.writeFileSync(imgpath, buffer, {})

    console.log('done', imgpath)
    console.log(req.user)
    console.log(imgpath)
    req.user.image = imgpath
    console.log(req.user)
    // const product = await
    req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error:error.message})
})

router.get("/products",auth,(req,res)=>{

    products.find({}).then((product)=> {
        res.json(product)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.get("/products/:id",auth,async (req, res)=>{
    const _id = req.params.id
    try {
        const product = await products.findOne({_id,owner:req.user._id})
        if (!product) {
            return res.status(404).send()
        }
        res.send(product)
    }
    catch(error) {
        res.status(500).send(error)
    }
})


router.patch("/products/:id",verifyToken, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["products","img","desc"]
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const product = await products.findByIdAndUpdate(req.params.id)

        updates.forEach((update)=>product[update]=req.body[update])
        await product.save()
        // try{
        //     const Task = await task.findByIdAndUpdate(_id,req.body, { new:true, runValidators:true })
        //     if (!Task){
        //         return res.status(404)
        //     }
        res.send(product)
        res.status(201).send()
    }catch (e){
        res.status(400).send(e)
    }
})

router.delete("/products/:id",verifyToken, async(req,res)=>{
    const _id = req.params.id
    try{
        const product = await products.findByIdAndDelete(_id)
        if(!product){
            res.status(404).send()
        }
        res.send(product)
    }catch(e){
        res.status(400).send()
    }

})

module.exports = router