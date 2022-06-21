const express = require("express")
const order = require("../models/order.js");
const {auth, verifyToken} = require("../middleware/auth.js")
const router = new express.Router()

router.post("/order",auth, async(req, res)=>{
    // const Task = new task(req.body)
    const orders = new order({
        ...req.body,
        owner: req.user._id
    })

    try{
        await orders.save()
        res.status(201).send(orders)
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


router.get("/order",verifyToken,async(req,res)=>{

    order.find({}).then((orders)=> {
        res.json(orders)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.get("/order/:id",auth,async (req, res)=>{
    const _id = req.params.id
    try {
        const orders = await order.find({_id,owner:req.user._id})
        if (!orders) {
            return res.status(404).send()
        }
        res.send(orders)
    }
    catch(error) {
        res.status(500).send(error)
    }
})


router.patch("/order/:id",verifyToken, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["userId","products","quantity","amount","address","status"]
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const orders = await order.findByIdAndUpdate(req.params.id)

        updates.forEach((update)=>orders[update]=req.body[update])
        await orders.save()
        // try{
        //     const Task = await task.findByIdAndUpdate(_id,req.body, { new:true, runValidators:true })
        //     if (!Task){
        //         return res.status(404)
        //     }
        res.send(orders)
        res.status(201).send()
    }catch (e){
        res.status(400).send(e)
    }
})

router.delete("/order/:id",auth, async(req,res)=>{
    const _id = req.params.id
    try{
        const orders = await order.findByIdAndDelete(_id)
        if(!orders){
            res.status(404).send()
        }
        res.send(orders)
    }catch(e){
        res.status(400).send()
    }

})

module.exports = router