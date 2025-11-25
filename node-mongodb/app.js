const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    const userId = '5baa2528563f16379fc8a610';  // temporary static user

    let user = await User.findById(userId);

    if (!user) {
      console.log('⚠️ No user found. Creating a default user...');

      const newUser = new User('Ayush', 'ayush@example.com', { items: [] });
      const result = await newUser.save();
      req.user = result.ops ? result.ops[0] : newUser;
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    console.log('❌ Error fetching/creating user:', err);
    next();
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

 
mongoConnect(() => {
  app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
  });
});
