const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const passport = require('passport');
const session = require('express-session');


//DB config
const db = require('./config/keys').MongoURI;


//Connect to Mango
mongoose.connect(db, { useNewUrlParser: true})
.then(() => console.log('MongoDB connected...'))
.catch(err=>console.log(err));


//Passport config
require('./config/passport')(passport);

//MIDDLEWARE
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

app.use(passport.initialize());
app.use(passport.session());

//Bodyparser
app.use(express.urlencoded({extended: false}));


//GET
app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/users/register', (req, res) => {
    res.render('register.ejs');
})

app.get('/users/login', (req, res) => {
    res.render('login.ejs');
})

app.get('/users/dashboard', (req, res) => {
    res.render('dashboard.ejs');
});


app.get('/users/logout', (req, res) => {
    res.redirect('/');
})










//POST
app.post('/users/register', (req, res) => {
    const {name, email, password, password2} = req.body;

    //Check fields
    let errors =[];
    if (!name || !email || !password || !password2) {
        errors.push({message: 'Please fill in all fields'});
    }

    //Passwords don't match
    if (password !== password2) {
        errors.push({message: 'Passwords do not match'});
    }
    if (errors.length > 0) {
        res.render('register');
    } else {
        User.findOne({email: email})
        .then((user) => {
            if (user) {
                errors.push({message: 'Email already used'});
                res.render('register');
            } else {
                const newUser = new User( {
                    name,
                    email,
                    password,
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                
                        newUser.password = hash;

                        newUser.save()
                        .then(user => {
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    })
                })
                
            } 
                
        })
        .catch(err => console.log(err));
    }
})



app.post('/users/login', 
  passport.authenticate('local', { failureRedirect: '/users/login' }),
  function(req, res) {
    res.redirect('/users/dashboard');
  });







app.listen(3000, () => {
    console.log('Server is listening on port 3000...');
})