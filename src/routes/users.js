const express = require('express')
const multer = require("multer")
const sharp = require("sharp")
const User = require('../models/users.js')
const {auth, verifyToken} = require('../middleware/auth')
const {request} = require("express");
const router = new express.Router()
const fs = require('fs')


//signupppp
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user, token})
        res.status(201).send()
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//get all users in db
// router.get('/users',async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

//get all accounts signedup in the application
router.get('/users',verifyToken, async (req, res)=>{
    User.find({}).then((users)=> {
        res.json(users)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

//get one account logged in by user
router.get('/users/me',auth, async (req, res)=>{
    res.send(req.user)
})

// //get info by id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//
//     try {
//         const user = await User.findById(_id)
//
//         if (!user) {
//             return res.status(404).send()
//         }
//
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

//update details
router.patch('/users/me', verifyToken, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {


        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete a user by db
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        //
        // if (!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
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




router.post("/users/me/avatar",auth, upload.single('avatar'), async(req,res)=> {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()

    const filePath = `${process.cwd()}/avatars/avatar-${new Date().toISOString()}.png`

    fs.writeFileSync(filePath, buffer, {})

    console.log('done', filePath)
    req.user.avatar = filePath
    const user = await req.user.save()
    res.send(user)
},(error, req, res, next)=>{
    res.status(400).send({error:error.message})
})


router.delete("/users/me/avatar", auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get("/users/:id/avatar", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router