const Redis = require('ioredis');
const redis = new Redis();
const pipeline = redis.pipeline();

async function rateLimiter(req, res, next) {
    try {
        const key = `rateLimit:${req.ip}`;
        const now = Date.now();

        await pipeline.zremrangebyscore(key, 0, now - 60000);

        const count = await redis.zcard(key);

        if (count >= 15) {
            return res.status(429).json({
                message: 'Too many requests'
            });
        }

        await pipeline.zadd(key, now, `${now}-${Math.random()}`);

        await pipeline.expire(key, 60);

        next();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Rate limiter error'
        });
    }
}

module.exports = rateLimiter;

//Command	What it does
// zremrangebyscore()	Removes old request timestamps.
// zcard()	Counts remaining requests.
// zadd()	Stores a new request timestamp.
// expire()	Automatically deletes inactive Redis keys.