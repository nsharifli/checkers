var express = require('express')
var app = express()

app.use(express.static('public'))

//Routes

app.get('/df', function (req, res) {
  res.send('/df requested!')
})

// Starts express server listening on 3000
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})