const bcrypt = require('bcryptjs')
const User = require('../models/schema');

async function passWordChecker(req,res) {

        const email = req.body.email
        const pass = req.body.pass 
        try{
        if(!email || !pass && typeof email != 'string' || typeof pass != 'string' ){
            return res.status(401).json({message: 'email or pass is missing'})
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message: 'Invalid email'})
        }

        const ok = await bcrypt.compare(pass,user.hash)

        if(!ok){
            return res.status(401).json({message: 'Invalid pass'})
        }else{
            return res.status(200).json({message:'Valid user',info: user})
        }

    }
    catch(err){
        res.status(400).json({message:err})
    }

}

module.exports = passWordChecker