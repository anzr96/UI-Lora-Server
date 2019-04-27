let { Router } = require('express');
var router = Router();
var passport = require('passport');
var Users = require('../models/Users');
let { connect, model } = require('mongoose');
let authenticated = require('./authenticated');
let next_url = require('./nexturl');

/* GET users listing. */
router.get('/register', function(req, res) {
    res.render('pages/login', { });
});

router.post('/register', next_url, function(req, res) {
    console.log("register start");
    if (req.body.password !== req.body.rpassword || req.body.agree === undefined || req.body.agree !== 'on'){
        return res.status(400).render('pages/login');
    }
    Users.register(new Users({ username : req.body.username, email: req.body.email, name: req.body.fullname }), req.body.password, function(err, user) {
        if (err) {
            return res.render('pages/login', { user : user });
        }

        console.log("register successfully");

        passport.authenticate('local')(req, res, function () {
            res.redirect(req.next_url);
        });
    });
});

router.get('/login', function(req, res) {
    res.render('pages/login');
});

router.post('/login', passport.authenticate('local'), next_url, function(req, res) {
    console.log(req.next_url);
    res.send(req.next_url);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;
