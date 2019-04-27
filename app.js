const createError = require('http-errors');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const node_acl = require('acl');
var acl;

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Models
require('./models/Users');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uplinkRouter = require('./routes/uplinks');
var eventsRouter = require('./routes/events');
var liveRouter = require('./routes/live');
var liveDataRouter = require('./routes/liveData');
var authentication = require('./routes/login');

var app = express();

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'passport-tutorial',
    cookie: {maxAge: 60 * 60 * 1000},
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

if (!isProduction) {
    app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost:27017/lora_server', {useNewUrlParser: true});
mongoose.set('debug', true);

//Routes
require('./config/passport');
app.use(require('./routes'));
app.use('/v1/uplink/', uplinkRouter);
app.use('/v1/events/', eventsRouter);
app.use('/v1/users/', usersRouter);
app.use('/v1/live/', liveDataRouter);
app.use('/live/', liveRouter);
app.use('/users', usersRouter);
app.use('/auth/', authentication);
app.use('/', indexRouter);

// passport config
const User = require('./models/Users');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting up node_acl
function authorization_setup(error, db) {

    var mongoBackend = new node_acl.mongodbBackend(db /*, {String} prefix */);

    // Create a new access control list by providing the mongo backend
    //  Also inject a simple logger to provide meaningful output
    acl = new node_acl(mongoBackend, logger_acl());

    // Defining roles and routes
    set_roles();
    set_routes();
}

// This creates a set of roles which have permissions on
//  different resources.
function set_roles() {

    // Define roles, resources and permissions
    acl.allow([
        {
            roles: 'admin',
            allows: [
                {resources: '/secret', permissions: '*'}
            ]
        }, {
            roles: 'user',
            allows: [
                {resources: '/secret', permissions: 'get'}
            ]
        }, {
            roles: 'guest',
            allows: []
        }
    ]);

    // Inherit roles
    //  Every user is allowed to do what guests do
    //  Every admin is allowed to do what users do
    acl.addRoleParents('user', 'guest');
    acl.addRoleParents('admin', 'user');
}


// This gets the ID from currently logged in user
function get_user_id(request, response) {

    // Since numbers are not supported by node_acl in this case, convert
    //  them to strings, so we can use IDs nonetheless.
    return request.user && request.user.id.toString() || false;
}

// Helper used in session setup by passport
function find_user_by_id(id, callback) {

    var index = id - 1;

    if (users[index]) {
        callback(null, users[index]);
    } else {
        var error = new Error('User does not exist.');
        error.status = 404;
        callback(error);
    }
}

// Helper used in the local strategy setup by passport
function find_by_username(username, callback) {

    var usersLength = users.length,
        i;

    for (i = 0; i < usersLength; i++) {
        var user = users[i];
        if (user.username === username) {
            return callback(null, user);
        }
    }

    return callback(null, null);
}

// Generic debug logger for node_acl
function logger_acl() {
    return {
        debug: function (msg) {
            console.log('-DEBUG-', msg);
        }
    };
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
