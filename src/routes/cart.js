const express = require("express")
const cart = require("../models/cart.js");
const {auth} = require("../middleware/auth.js")
const router = new express.Router()

router.post("/cart",auth, async(req, res)=>{
    // const Task = new task(req.body)
    const carts = new cart({
        ...req.body,
        owner: req.user._id
    })

    try{
        await carts.save()
        res.status(201).send(carts)
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


router.get("/carts",auth,async(req,res)=>{

    cart.find({}).then((carts)=> {
        res.json(carts)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.get("/carts/:id",auth,async (req, res)=>{
    const _id = req.params.id
    try {
        const carts = await cart.findOne({_id,owner:req.user._id})
        if (!carts) {
            return res.status(404).send()
        }
        res.send(carts)
    }
    catch(error) {
        res.status(500).send(error)
    }
})


router.patch("/carts/:id",auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["userId","products","quantity"]
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const carts = await cart.findByIdAndUpdate(req.params.id)

        updates.forEach((update)=>carts[update]=req.body[update])
        await carts.save()
        // try{
        //     const Task = await task.findByIdAndUpdate(_id,req.body, { new:true, runValidators:true })
        //     if (!Task){
        //         return res.status(404)
        //     }
        res.send(carts)
        res.status(201).send()
    }catch (e){
        res.status(400).send(e)
    }
})

router.delete("/carts/:id",auth, async(req,res)=>{
    const _id = req.params.id
    try{
        const carts = await cart.findByIdAndDelete(_id)
        if(!carts){
            res.status(404).send()
        }
        res.send(carts)
    }catch(e){
        res.status(400).send()
    }

})

module.exports = router