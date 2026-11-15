const express = require('express')
const router = express.Router()
const cache = require('../lib/cacheData');
const rateLimiter = require('../lib/rateLimiter')
const registerUser = require('../controller/register')
const passWordChecker = require('../controller/verify-pass')
const validateEmail = require('../middleware/validateEmail')
router.use('/api/verify',passWordChecker)
const User = require('../models/schema');
router.use('/api/fetch-data',cache,rateLimiter)

router.post('/api/register', validateEmail, registerUser)


router.get('/api/fetch-data',async (req,res)=>{
    const email = req.query.email;

    try{
        if (email) {
            const user = await User.findOne({email});
            return res.status(200).json(user);
        }

        const users = await User.find()
        res.json(users)
    }catch(err){
        res.status(404).json({message: "Mongo error"})
    }
})

router.delete('/api/delete',async(req,res)=>{
    const email = req.query.email;
    try{
        if(email){
            await User.findOneAndDelete({email})
            return res.status(200).json({message: 'Deleted'})
        }else{
            res.status(404).json({message:'No email found with req body'})
        }
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
})

router.post('/api/verify',async(req,res)=>{

})

module.exports = router