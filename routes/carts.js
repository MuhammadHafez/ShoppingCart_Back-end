var express = require('express');
var router = express.Router();
const { isSignIn } = require('../JWT/GenerateToken');
const { STRIPE_SECRET_KEY } = require('../KEYS/Keys')
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get User Cart
router.get('/', isSignIn, function (userData, req, res, next) {
    Cart.findById(userData.id, 'products totalQuantity totalPrice')
        .then(result => {
            if (result) {
                res.status(200).json({ message: result })
            } else {
                res.status(200).json({ message: 'You dont have a cart' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
});

// Add Product To Cart
router.post('/addtocart', isSignIn, async function (userData, req, res, next) {
    const ID = req.body.id
    const quantity = parseInt(req.body.quantity);
    const price = parseInt(req.body.price);

    let isFound, tmpCart, tmpProduct;
    // Check User has cart
    await Cart.findById(userData.id)
        .then(result => {
            if (result) {
                isFound = true;
                tmpCart = result;
            } else {
                isFound = false;
            }
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });

    await Product.findById({ _id: ID })
        .then(product => {
            tmpProduct = {
                _id: product._id,
                image: product.image,
                name: product.name,
                informations: product.informations,
                price: product.price * quantity,
                quantity: quantity
            }
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        });


    if (!isFound) {
        const cart = new Cart({
            _id: userData.id,
            products: [tmpProduct],
            totalQuantity: tmpProduct.quantity,
            totalPrice: tmpProduct.price,
        });

        cart.save()
            .then(response => {
                res.status(200).json({ message: 'Saved' })
            })
            .catch(err => {
                res.status(500).json({ message: err.message })
            })
    } else {
        //Check Cart has a product
        let productIndex = tmpCart.products.findIndex(product => product._id.toString() === tmpProduct._id.toString());

        if (productIndex !== -1) {
            tmpCart.products[productIndex].quantity += tmpProduct.quantity;
            tmpCart.products[productIndex].price += tmpProduct.price;
            tmpCart.totalQuantity += tmpProduct.quantity;
            tmpCart.totalPrice += tmpProduct.price;

        } else {
            tmpCart.products.push(tmpProduct);
            tmpCart.totalQuantity += tmpProduct.quantity;
            tmpCart.totalPrice += tmpProduct.price;
        }

        Cart.updateOne({ _id: tmpCart._id }, { $set: tmpCart })
            .then(response => {
                console.log()
                if (response.n === 1) {
                    res.status(200).json({ message: 'Updated' })
                } else {
                    res.status(200).json({ message: 'Not Updated' })
                }
            })
            .catch(err => {
                res.status(500).json({ message: err.message })
            })
    }
})


// Delete Product 
router.get('/deletefromcart/:id', isSignIn, async function (userData, req, res, next) {
    let tmpCart;
    await Cart.findById(userData.id)
        .then(cart => tmpCart = cart)
        .catch(err => {
            res.status(500).json({ message: err.message })
        });

    let index = tmpCart.products.findIndex(product => product._id.toString() === req.params.id);

    tmpCart.totalQuantity -= tmpCart.products[index].quantity;
    tmpCart.totalPrice -= tmpCart.products[index].price;

    tmpCart.products.splice(index, 1);

    if (tmpCart.products.length === 0) {
        Cart.deleteOne({ _id: tmpCart._id })
            .then(response => res.status(200).json({ message: response }))
            .catch(err => { res.status(500).json({ message: err.message }) })
    } else {
        Cart.updateOne({ _id: tmpCart._id }, { $set: tmpCart })
            .then(response => res.status(200).json({ message: response }))
            .catch(err => { res.status(500).json({ message: err.message }) })
    }
});

// Pay Check
router.post('/payment', isSignIn, async function (userData, req, res, next) {

    let success = false;

    const body = {
        source: req.body.token.id,
        amount: req.body.amount,
        currency: "usd"
    };

    await stripe.charges.create(body)
        .then(
            Cart.deleteOne({ _id: userData.id })
                .then(response => res.status(200).json({ message: response }))
                .catch(err => res.status(500).json({ message: err.messgae })))
        .catch(err => res.status(500).json({ message: err.message }));
});

module.exports = router;
