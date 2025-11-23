var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
// Parte desse arquivo foi gerado automaticamente pelo express, já o resto, foi colocado para que o vercel saiba aonde acessar para buscar certas rotas, ou certos modulos
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var autoresRouter = require('./routes/autores');
var artistasRouter = require('./routes/artistas');
var livrosRouter = require('./routes/livros');
var cdsRouter = require('./routes/cds');
var dvdsRouter = require('./routes/dvds');
var hqsRouter = require('./routes/hqs');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB)
  .then(() => console.log('MongoDB conectado com sucesso.'))
  .catch(err => console.error('Erro na conexão com MongoDB:', err));

var app = express();

const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/autores', autoresRouter);
app.use('/artistas', artistasRouter);
app.use('/livros', livrosRouter);
app.use('/cds', cdsRouter);
app.use('/dvds', dvdsRouter);
app.use('/hqs', hqsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
