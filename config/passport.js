const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


//Load User Model
const User = require('../models/User');
module.exports = function(passport) {
    passport.use(
        new LocalStrategy( {usernameField: 'email'}, (email, password, done) => {
           User.findOne({email : email})
           .then((user) => {
                if (!user) {
                    return done(null, false, {message: 'No such email in our database'});
                } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (!isMatch) {
                            return done(null, false, {message: 'The password does not match the email'});
                        } else {
                            return done(null, user);
                        }
                    });
                }
           })
           .catch(err => console.log(err));
        }));


passport.serializeUser((user, done)  =>{
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user)  => {
        done(err, user);
    })
})

}
