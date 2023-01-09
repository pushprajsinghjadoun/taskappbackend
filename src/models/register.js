const mongoose  = require("mongoose")
const bcrypt = require("bcryptjs")
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone:
    {
        type:Number,
        required: true
    },
    email: {
        type:String,
        unique:true,
        requried: true,
        trim: true,
        lowercase: true
    },
    password:
    {
        type:String
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email,password) =>{
    console.log("working")
    const user = await User.findOne({email})

    if(!user)
    {
        throw new Error('Unable to Login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
    {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save',async function (next) {
    const user = this
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

const User = mongoose.model('User',userSchema)


module.exports = User;