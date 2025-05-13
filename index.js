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


const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  userId: String // Reference to the user
})

const User = mongoose.model('User', userSchema)
const Exercise = mongoose.model('Exercise', exerciseSchema)


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const newUser = new User({
    username: req.body.username
  })
  await newUser.save()
  res.send(newUser)
})

app.get('/api/users', async (req, res) => {
  const users = await User.find({})
  res.json(users.map(user => ({
      username: user.username,
      _id: user._id
  })))
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id
  const { description, duration, date } = req.body
  const user = await User.findById(id);
  if(!user) return res.send(`${user} not found`)
    const newExercise = new Exercise({
      username:  user.username,
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
      userId: user._id
    })
    await newExercise.save()
    res.json({
       _id:user._id,
      username: user.username,
      date: newExercise.date,
      duration: newExercise.duration,
      description: newExercise.description      
    })
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);
  if (!user) return res.send("User not found");
  let filter = { userId: user._id };
  
  // Handle date filtering
  if (from || to) {
    filter.date = {};
    if (from) {
      const fromDate = new Date(from);
      filter.date.$gte = fromDate.toDateString();
    }
    if (to) {
      const toDate = new Date(to);
      filter.date.$lte = toDate.toDateString();
    }
  }

  // Find exercises and apply limit if specified
  let query = Exercise.find(filter);
  if (limit) {
    query = query.limit(Number(limit));
  }

  const logs = await query.exec();

  // Format response
  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});


app.listen(port, () => {
  console.log('Your app is listening on port ' + port)
})
