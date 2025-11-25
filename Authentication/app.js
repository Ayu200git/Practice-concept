const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const app = express();

const errorController = require('./controllers/error');
const User = require('./models/user');

const MongoDB_URI =
  'mongodb+srv://ayushks2805_db_user:PNtCBt8amzbgIhRj@cluster0.rcjoti7.mongodb.net/snapShop?retryWrites=true&w=majority&appName=Cluster0';

 
const store = new MongoDBStore({
  uri: MongoDB_URI,
  collection: 'sessions'
});

 
const csrfProtection = csrf();

 
app.set('view engine', 'ejs');
app.set('views', 'views');

 
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

 
app.use(
  session({
    secret: 'notert',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

 
app.use(flash());

 
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => next(err));
});

 
app.use(csrfProtection);

 
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.path = req.path;  
  next();
});

 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

 
app.use(errorController.get404);



 
mongoose
  .connect(MongoDB_URI)
  .then(() => User.findOne())
  .then(user => {
    if (!user) {
      const newUser = new User({
        name: 'ayu',
        email: 'atyu2133@gmail.com',  
        cart: { items: [] }
      });
      return newUser.save();
    }
  })
  .then(() => {
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
  })
  .catch(err => console.log(err));
