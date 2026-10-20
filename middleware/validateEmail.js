const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const ROLE_ADDRESSES = new Set(['admin', 'info', 'support', 'sales', 'noreply']);

function validateEmail(req, res, next) {
    const {email} = req.body;

    if (typeof email !== 'string') {
        return res.status(400).json({
            error: 'This is not a String',
            valid: false
        });
    }

    const value = email.trim();

    if (value.length === 0) {
        return res.status(400).json({
            error: 'Kindly provide an input',
            valid: false
        });
    }

    if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
        return res.status(400).json({
            message: 'Not a valid mail',
            valid: false
        });
    }

    const at = value.lastIndexOf('@');
    const name = value.slice(0, at).toLowerCase();
    const domain = value.slice(at + 1);

    req.emailData = { // req. here binds the calculated data to that specific req
        value,
        name,
        domain,
        role: ROLE_ADDRESSES.has(name)
    };

    next();
}

module.exports = validateEmail;
