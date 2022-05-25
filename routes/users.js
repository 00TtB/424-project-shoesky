const   express = require('express'),
        router  = express.Router(),
        passport  = require('passport'),
        bcrypt  = require('bcryptjs'),
        User = require('../models/user');

router.get('/register', function(req, res){
    res.render('register.ejs', {
        title: 'Register'
    });
});

router.post('/register', function(req, res){
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let address = req.body.address;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);
    req.checkBody('address', 'Address is required!').notEmpty();

    let errors = req.validationErrors();

    if(errors){
        res.render('register.ejs', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({username: username}, function(err, user){
            if(err)
                console.log(err);

            if(user){
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    address: address,
                    admin: 0
                });
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(user.password, salt, function(err, hash){
                        if(err)
                            console.log(err);

                        user.password = hash;

                        user.save(function(err){
                            if(err){
                                console.log(err);
                            } else {
                                // req.flash('success', 'You are now registered!');
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });
        
    }
});

router.get('/login', function(req, res){

    if(res.locals.user) res.redirect('/');

    res.render('login.ejs', {
        title: 'Login'
    });
});

router.post('/login', function(req, res, next){

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/users/login');
});

module.exports = router;