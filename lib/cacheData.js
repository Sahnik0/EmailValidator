const Redis = require('ioredis')
const redis = new Redis()


async function cache(req,res,next) {
    const {email} = req.emailData
    const key = `key:${email}`
    const cached = await redis.get(key)

    if(cached){
        req.emailData = JSON.parse(cached);
        console.log("hit")
        return next();
    }

    await redis.set(key,JSON.stringify(req.emailData),'EX',60)

    next()
}

module.exports = cache