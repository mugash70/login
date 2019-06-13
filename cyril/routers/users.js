var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');
// register
router.get('/register', (req, res) => {
    res.render('register');
});
// login
router.get('/login', (req, res) => {
    res.render('login');
});
// register user
router.post('/register', (req, res) => {
    // form values
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    //check form validation
    req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'passwords do not match').equals(req.body.password);

    // errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,

        });
        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user)

        });
        req.flash('success_msg', 'you are registered and can now login ');

        res.redirect('/users/login');
    }
});
//login section
passport.use(new localStrategy(
    // {
    //     usernameField: 'username',
    //     passwordField: 'password',

    // },
    (username, password, done) => {
        User.getUserByUsername(username, (err, user) => {
            if (err) throw err;
            if (!user) {
                console.log(' No user with the username')
                return done(null, false, { message: 'Incorrect username.' });
            }
            User.comparePassword(password, user.password, (err, isMatch) => {
                // console.log(password)
                // console.log(User.password)
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'incorrect password' });
                }
            });
        });
    }));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});

router.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    (req, res) => {
        res.redirect('/');
    });
//log out
router.get('/logout', (req, res) => {
    req.logout();

    req.flash('success_msg', 'you are logged out');

    res.redirect('/users/login');
});
exports.save = (document, callback) => {
    document.save(callback);
}

module.exports = router;