const express = require('express')
const router = express.Router()
const validateEmail = require('../middleware/validateEmail')

router.post('/', validateEmail, (req, res) => {
    const {name, domain, role, mx} = req.emailData;

    return res.status(200).json(
        {message: 'Valid mail',valid: true ,name, domain, role, mx})
})

module.exports = router