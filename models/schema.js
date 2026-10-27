const mongoose = require('mongoose')

//name, domain, role, mx
const userSchema = mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String
        },
        domain:{
            type: String,
            required: true,
        },
        role:{
            type: String
        },
        mx:{
            type: Boolean
        }
    },
    {
        timestamps: true
    }
)

const user = mongoose.model("user",userSchema)

module.exports = user