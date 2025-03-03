require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





app.listen(port, () => {
  console.log('Your app is listening on port ' + port)
})
