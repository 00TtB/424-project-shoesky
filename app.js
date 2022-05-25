const   express     = require('express'),
        path        = require('path'),
        app         = express(),
        mongoose    = require('mongoose'),
        bodyParser  = require('body-parser'),
        expressValidator = require('express-validator'),
        flash       = require('connect-flash'),
        session     = require('express-session'),
        fileUpload  = require('express-fileupload'),
        passport  = require('passport'),
        config      = require('./config/database'),
        pages       = require('./routes/pages'),
        adminPages  = require('./routes/admin_pages'),
        adminCategories  = require('./routes/admin_categories'),
        adminProducts    = require('./routes/admin_products'),
        products    = require('./routes/products'),
        cart        = require('./routes/cart'),
        users        = require('./routes/users'),
        Page        = require('./models/page'),
        Order        = require('./models/order'),
        Category    = require('./models/category');

mongoose.connect('mongodb://localhost/shoesky');
app.set('views', path.join(__dirname, 'views'));
app.set('views engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.locals.errors = null;

Page.find({}).sort({sorting: 1}).exec(function(err, pages){
  if(err){
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

Category.find(function(err, categories){
  if(err){
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
}));

app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        let namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
      
      while(namespace.length){
        formParam += '{' + namespace.shift() + '}';
      }
      return{
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: function(value, filename){
        let extension = (path.extname(filename)).toLowerCase();
        switch(extension){
          case '.jpg':
            return '.jpg';
          case '.jpeg':
            return '.jpeg';
          case '.png':
            return '.png';
          case '.webp':
            return '.webp';
          case '':
            return '.jpg';
          default:
            return false;
        }
      }
    }
}));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);


app.get('/', function(req, res){
    res.render('index.ejs', {
        title: 'Home'
    });
});

app.listen(3000, function(){ 
    console.log("Activated");
});