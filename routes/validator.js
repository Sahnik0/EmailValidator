const express = require('express')
const app = express()
const router = express.Router()
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

router.use(express.json())
router.use(express.urlencoded({extended:true}))

router.post('/',(req,res)=>{

    const {email} = req.body

    if (email.length > 254) return false;

    if(typeof email !== 'string'){
        return res.status(400).json({message: 'This is not a String',valid: false})
    }
    const value = email.trim()
    if(value.length == 0){
        return res.status(400).json({message: 'Kindly provide an input',valid: false})
    }
    if(!EMAIL_PATTERN.test(value)){
        return res.status(400).json({message: 'Not a valid mail',valid: false})
    }
    return res.status(200).json({message: 'Valid mail',valid: true})

})

module.exports = router