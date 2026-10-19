const express = require('express')
const app = express()
const port = 5000

app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.json({
        creator: "Sahnik Biswas",
        info: "Hii this is an email validator !!, You can intregate with your sign up flow.",
        usecase: "Kindly go to /api/validate to use this end point"})
    })

app.listen(port,()=>{
    console.log(`app is running on ${port}`)
})