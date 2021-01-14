const { response } = require('express');
var express = require('express');
const Product = require('../models/Product');
var router = express.Router();


// Get All Products
router.get('/', function(req, res, next) {
  Product.find()
  .then(response => {
    if(response.length > 0){
      res.status(200).json({ message : response })
    }else{
      res.status(200).json({ message : [] })
    } 
  }).catch(err=>{
    res.status(500).json({ message: err.message })
  })
});

// Get Specific Product
router.get('/getproduct/:id', function(req,res,next){
    Product.findById({_id: req.params.id})
    .then(response => res.status(200).json({ message: response }))
    .catch(err => res.status(500).json({ message: err.message }))
});



module.exports = router;
