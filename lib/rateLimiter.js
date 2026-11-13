const Redis = require('ioredis');
const redis = new Redis();

async function rateLimiter(req, res, next) {
    const key = `userIp:${req.ip}`;

    try {
        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60);
        }

        if (count > 10) {
            res.set('Retry-After', '60');
            return res.status(429).json({
                error: 'Too many requests',
                valid: false
            });
        }

        next();
    } catch (error) {
        return res.status(503).json({
            error: 'Rate limiter unavailable',
            valid: false
        });
    }
}

module.exports = rateLimiter;