var express = require('express');
var router = express.Router();
var multer = require('multer');
const fs = require('fs');

const { isAdmin } = require('../JWT/GenerateToken');
const Product = require('../models/Product');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let fname = req.body.name + file.originalname.slice(-4)
        cb(null, fname)
    }
})

async function fileFilter(req, file, cb) {

    req.body = JSON.parse(JSON.stringify(req.body));

    if (file.mimetype === 'image/jpeg') {
        if (req.body.update === 'withImage') {
            cb(null, true)
        } else {
            await Product.find({ name: req.body.name })
                .then(result => {
                    if (result.length === 0) { cb(null, true) }
                    else { cb(new Error('This Product already exist'), true) }
                })
                .catch(err => cb(new Error(err.message), true))
        }
    } else {
        cb(new Error('Product Image should be JPG'));
    }
}

var upload = multer({
    limits: { fileSize: (1024 * 1024 * 5) },
    fileFilter: fileFilter,
    storage: storage
})

router.post('/addproduct', upload.single('image'), isAdmin, function (req, res, next) {
    const newProduct = new Product({
        image: 'http://localhost:3001/' + req.file.filename,
        name: req.body.name,
        informations: {
            operatingSystem: req.body.os,
            hardDiskCapacity: req.body.harddisk,
            processorFamily: req.body.cpu,
            screenSize: req.body.screen,
            memorySize: req.body.ram
        },
        price: req.body.price
    });

    newProduct.save()
        .then(saved => res.status(200).json({ message: 'Added Successfuly' }))
        .catch(err => res.status(500).json({ message: err.message }))
});


router.delete('/deleteproduct/:id', isAdmin, async function (req, res, next) {
    let img;
    await Product.findById(req.params.id)
        .then(product => img = product.image)
        .catch(err => res.status(500).json({ message: err.message }));
    img = img.slice(22)
    try {
        fs.unlinkSync('uploads/' + img)
        Product.deleteOne({ _id: req.params.id })
            .then(deleted => {
                res.status(200).json({ message: 'deleted Successfuly' });

            })
            .catch(err => res.status(500).json({ message: err.message }))
    } catch (err) {
        new Error('problem in deleting file')
    }

})

router.post('/updateproduct/:id', upload.single('image'), isAdmin, async function (req, res, next) {
    req.body = JSON.parse(JSON.stringify(req.body));

    await Product.findById(req.params.id)
        .then(product => tmpProduct = product)
        .catch(err => res.status(500).json({ message: err.message }));

    tmpProduct.name = req.body.name;
    tmpProduct.informations.operatingSystem = req.body.operatingSystem;
    tmpProduct.informations.hardDiskCapacity = req.body.hardDiskCapacity;
    tmpProduct.informations.processorFamily = req.body.processorFamily;
    tmpProduct.informations.screenSize = req.body.screenSize;
    tmpProduct.informations.memorySize = req.body.memorySize;
    tmpProduct.price = req.body.price;

    await Product.updateOne({ _id: tmpProduct._id }, { $set: tmpProduct })
        .then(response => res.status(200).json({ message: response }))
        .catch(err => res.status(500).json({ message: err.message }));
})


module.exports = router;
