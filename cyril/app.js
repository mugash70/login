var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var mongoose = require('mongoose')



var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("connected to mongoDB")
})

var routes = require('./routers/index');
var users = require('./routers/users');
//init App
var app = express();
// router
app.set('views', path.join(__dirname, '/views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');
//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//static folder
app.use(express.static(path.join(__dirname, 'public')));
//express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
    errorFomatter: (param, msg, value) => {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
// flash
app.use(flash());
//global 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    res.locals.user = req.users || null;
    next()
});

app.use('/', routes);
app.use('/users', users);

//port
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => {
    console.log('Server started on port' + ':' + app.get('port'));
});