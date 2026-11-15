const mongoose = require('mongoose')

//name, domain, role, mx
const userSchema = mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
            index: true
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
        },
        hash: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const user = mongoose.model("user",userSchema)

module.exports = user