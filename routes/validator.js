const express = require('express')
const router = express.Router()
const validateEmail = require('../middleware/validateEmail')
const cache = require('../lib/cacheData');
const User = require('../models/schema')
const passWordChecker = require('../controller/verify-pass')

router.use('/api/validate',validateEmail, cache)
router.use('/api/verify',passWordChecker)
router.post('/api/validate',  async (req, res) => {
    const {email, name, domain, role, mx, hash} = req.emailData;
    try{
        const user = await User.create({
            email: email,
            name: name,
            domain: domain,
            role: role,
            mx: mx,
            hash: hash
        })

        res.status(201).json(user)
    }catch(err){
        res.json({message: `Here is the error ${err.message}`})
    }
    // return res.status(200).json(
    //     {emai: email, message: 'Valid mail',valid: true ,name, domain, role, mx})
})

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
            const user = await User.findOneAndDelete({email})
            return res.status(204).json(user)
        }else{
            res.status(404).json({message:'No email found with req body'})
        }
    }
    catch(err){
        res.status(400).json(err)
    }
})

router.post('/api/verify',async(req,res)=>{

})

module.exports = router