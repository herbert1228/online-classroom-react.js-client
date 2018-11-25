var express = require('express');
var app = express();

let count = 0

app.set('view engine', 'ejs')

app.use(function(req, res, next) {
  if (req.headers['user-agent'].indexOf('curl') >= 0) {
    res.status(500).end('curl requests are rejected')
  } else {
    next()
  }
})

app.use(function(req,res,next) {  // Mac disciminator middlware
  console.log(req.headers);
  if (req.headers['user-agent'].indexOf('Chrome') >= 0) {
    count++
  }
  next()
});

app.get('/', function(req,res,next) {
  res.render('count', {count})
});

app.listen(process.env.PORT || 8099);
