const express = require("express")

require('./db/mongoose.js')
const userRouter = require('./routes/users.js')
const productRouter = require('./routes/products.js')
const cartRouter = require('./routes/cart.js')
const orderRouter = require('./routes/order.js')

const app = express()
const port = process.env.PORT || 4000

// app.use((req,res,next)=>{
//         // res.status(505).send("site under maintenance")
//     next()
// })


app.use(express.json())
app.use(userRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(orderRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})