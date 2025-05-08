require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()


const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
        .then(res => console.log('Database connected'))
        .catch(err => console.log(err))

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const userSchema = new mongoose.Schema({
  username: String
})

const logSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: Number,
  log:[{
    description: String,
    duration: Number,
    date: String,
  }]
})

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  _id: String
})

const User = mongoose.model('User', userSchema)
const Log = mongoose.model('Log', logSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const newUser = new User({
    username: req.body.username
  })
  await newUser.save()
  res.send(`${newUser.username} saved`)
})

app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.body[':_id']
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = !req.body.date ? `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}` : req.body.date;
  const userId = await User.findById(id)
  if(!userId){
    res.send(`${userId} not found`)
  } else{
    const newExercise = new Exercise({
      description: description,
      duration: duration,
      date: new Date().toDateString(date),
      _id: userId._id
    })
    await newExercise.save()
    res.send('exercise saved')
  }
})

app.get('/api/users/:id/logs', async (req, res) => {
  const id  = req.params.id
  const username = await User.findById(id)
  const logs = await Exercise.findById(id)
  const newLog = new Log({
    username:username.username,
    count: 1,
    _id: id,
    log: [{
      description:logs.description,
      duration:logs.duration,
      date:new Date().toDateString(logs.date)
    }]
  })
  res.send(newLog)
})

app.listen(port, () => {
  console.log('Your app is listening on port ' + port)
})
