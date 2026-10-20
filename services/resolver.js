const {Resolver} = require('dns').promises;

const resolver = new Resolver({
    timeout: 2000,
    tries: 1
});

async function checkMX(domain) {
    try {
        const records = await resolver.resolveMx(domain);
        return records.length > 0 ? true : 'no';
        
    } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return 'no';
        }

        return 'unknown';
    }
}

module.exports = checkMX;
