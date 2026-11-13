const bcrypt = require('bycryptjs')
const router = require('router')


const {pass} = req.emailData
async function passWordHasher(pass){
    const hash = await bcrypt.hash(pass,10)
    return hash
}

async function passWordChecker(){

}

module.exports = passWordHasher