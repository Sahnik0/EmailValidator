const bcrypt = require('bcryptjs')
const User = require('../models/schema')

async function registerUser(req, res) {
    try {
        const { email, name, domain, role, mx } = req.emailData;
        const { pass } = req.body;
        const hash = await bcrypt.hash(pass, 10);
        const user = await User.create({
            email, name, domain, role, mx, hash
        });
        return res.status(201).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = registerUser;