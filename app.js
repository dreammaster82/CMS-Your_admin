global.mainDir = __dirname;
global.addFilePath = '/public';
global.imagePath = '/img';

const env = require('./config/env.json');
if (env) {
    Object.assign(process.env, env);
}

const express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    authorize = require('./app/authorize'),
    models = require('./models');

let routes = require('./routes');

let app = express();

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT');
    next();
});

// Public and modules static files
app.use(express.static(global.mainDir + '/public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'leginn',
    name: 'nsid',
    resave: true,
    saveUninitialized: true
}));

models.then(db => {
    app.use(authorize(db));

    app.use(routes(db));

// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json({message: err.message, name: err.name, stack: err.stack});
    });

    console.log('Start app');
});

module.exports = app;
