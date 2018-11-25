var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');

var SECRETKEY = 'I want to pass COMPS381F';

//`app.use(fileUpload());
app.use(bodyParser.json());
app.use(session({
	secret: SECRETKEY,
	resave: true,
	saveUninitialized: true
}));

var products = [
	{name: 'Apple iPad Pro', stock: 100, price: 7000, id:'001'},
	{name: 'Apple iPhone 7', stock: 50, price: 7800, id:'002'},
	{name: 'Apple Macbook', stock: 70, price: 11000, id: '003'}
];

app.set('view engine', 'ejs');

// var SECRETKEY1 = 'I want to pass COMPS381F';
// var SECRETKEY2 = 'Keep this to yourself';
//
// app.use(session({
//   name: 'session',
//   keys: [SECRETKEY1,SECRETKEY2]
// }));

app.get('/',function(req,res) {
	res.redirect('/read');
});

app.get('/read', function(req,res) {
	res.render('list', {c: products});
});

app.get('/showdetails', function(req,res) {
	var product = null;
	if (req.query.id) {
		for (i in products) {
			if (products[i].id == req.query.id) {
				product = products[i]
				break;
			}
		}
		if (product) {
			res.render('details', {c: products[i]});
		} else {
			res.status(500).end(req.query.id + ' not found!');
		}
	} else {
		res.status(500).end('id missing!');
	}
});

app.get('/shoppingcart', function(req,res) {
  console.log(req.session);
  if (req.session.cart != null){
    res.render('shoppingcart', {c: req.session.cart})
  } else {
    res.redirect('/')
  }
});

app.get('/add2cart', function(req,res) {
  if (req.query.id) {
    for (i in products) {
      if (products[i].id == req.query.id) {
        product = products[i]
        break;
      }
    }
    if (product) {
      if (req.session.cart == null) {
        req.session.cart = []
      }
      req.session.cart.push(product)
      res.redirect('/')
    } else {
      res.status(500).end(req.query.id + ' not found!');
    }
  } else {
    res.status(500).end('id missing!');
  }
})

app.get('/emptycart',function(req,res) {
  req.session.cart = null;
	res.redirect('/')
})

app.listen(process.env.PORT || 8099);
