var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/UMbook', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=> console.log('Mongo ready: ' + mongoose.connection.readyState))
  .catch(()=> console.log('Mongo: erro na conexão.'))

var apiRouter = require('./routes/api');


var passport = require('passport')
var JWTStrategy= require('passport-jwt').Strategy
var ExtractJWT = require('passport-jwt').ExtractJwt

var extractFromQS = function(req){
  var token = null
  if(req.query && req.query.token) token = req.query.token
  return token
}

var extractFromBody = function(req){
  var token = null
  if(req.body && req.body.token) token = req.body.token
  return token
}

passport.use(new JWTStrategy({
  secretOrKey: 'daw2019',
  jwtFromRequest:ExtractJWT.fromExtractors([extractFromQS,extractFromBody]),
  passReqToCallback: true
}, async (req,payload,done) =>{
  try{
    return done(null,payload)
  }
  catch(error){
    return done(error)
  }
}))


var app = express();

app.use(passport.initialize());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/publicacoes', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error page
  res.status(err.status || 500);
  res.jsonp(err)
});

module.exports = app;
