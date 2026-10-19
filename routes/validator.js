const express = require('express')
const app = express()
const router = express.Router()

app.use(express.urlencoded({extended: true}))

router.post('/',(req,res)=>{

    const {email} = req.body
    
    if(email == ''){
        res.json({message : 'Kindly enter a mail'})
    }else{
        res.json({message: 'Lets hope this is an email'})
    }

})

module.exports = router