const express = require('express')
const router = express.Router()
const validateEmail = require('../middleware/validateEmail')
const cache = require('../lib/cacheData');

router.post('/api/validate', validateEmail, cache,(req, res) => {
    const {email, name, domain, role, mx} = req.emailData;

    return res.status(200).json(
        {emai: email, message: 'Valid mail',valid: true ,name, domain, role, mx})
})

module.exports = router