const express = require("express");
const User = require('./models/register')
const Task = require('./models/task')
const jwt = require('jsonwebtoken')
require('./db/mongoose')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000
app.use(express.json());
app.use(cors())
app.options('*', cors());
// app.use((req,res,next)=>{
//     if(req.method==='GET')
//     {
//         res.send('GET requests are disabled')
//     }else
//     {
//         next()
//     }
// })


const auth  = async (req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisismynewcourse') 
        const user = await User.findOne({_id: decoded._id,'tokens.token': token})
        if(!user)
        {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({error : 'Please  Authenticate'})
        
    }
}
//REAL APP WORK START

app.post("/registeruser", async (req,res)=>{
    const user = new User(req.body)
    try{
        
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})
app.get("/getdata", async (req,res)=>{
    try{
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/taskdata',async (req,res)=>{
    const task = new Task(req.body)
    try{
         await task.save()
        console.log(task)
        res.status(201).send(task)

    } catch (e)
    {
        res.status(401).send(e);
    }
})


app.get("/gettaskdata/:id", async (req,res)=>{
    try{
        console.log(req.params.id)
        const task = await Task.find({userid: req.params.id})
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

app.delete("/deletetask/:id", async (req,res)=>{
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task)
        {
            console.log('fg')
            return res.status(404).send()
        }
        res.send(task)
    } catch (e)
    {
        res.status(500).send(e)
    }
})

// WORK CLOSE

app.get("/",auth,async (req,res)=>{
    try{
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
app.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


app.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

app.post('/register', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

app.patch('/update/:id', async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedupdates = ['name','age']
    const isvalidoperator = updates.every((update)=>{
        return allowedupdates.includes(update)
    })
    if(!isvalidoperator)
    {
        return res.send({"error":"Invalid updates"})
    }
    try{
        const user = await User.findById(req.params.id)
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        await user.save()
       // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!user)
        {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) 
    {
        res.status(400).send(e)
    }
})

// app.delete('/delete/:id', async (req,res)=>{
//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if(!user)
//         {
//             return res.status(404).send()
//         }
//         res.send({user, token})
//     } catch (e) 
//     {
//         res.status(500).send()
//     }
// })

app.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})



app.listen(port,()=>{
    console.log("Listening on port"+ port)
}) 