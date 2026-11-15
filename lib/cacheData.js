const Redis = require('ioredis')
const redis = new Redis()
const User = require('../models/schema');


async function cache(req,res,next) {
    const email = req.query.email
    const key = `key:${email}`
    const cached = await redis.get(key)

    if(cached){
        req.emailData = JSON.parse(cached);
        console.log("hit")
        return next();
    }else{
        console.log('miss')
    }

    const data = await User.findOne({email})
    await redis.set(key,JSON.stringify(data),'EX',20)

    next()
}

module.exports = cache