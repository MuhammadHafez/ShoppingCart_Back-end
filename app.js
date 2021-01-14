var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var path = require('path')

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cartsRouter = require('./routes/carts');
var productsRouter = require('./routes/products');

var app = express();
app.use(cors());



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'uploads')));

mongoose.connect('mongodb://localhost/Ecommerce',{useNewUrlParser: true,useUnifiedTopology: true , useCreateIndex: true})
.then(response => {
  console.log('DB is Connected...');
}).catch(err=>{
  console.log(err);
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/carts', cartsRouter);
app.use('/products', productsRouter);

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
  res.json({
    message: err.message
  })
});

module.exports = app;
