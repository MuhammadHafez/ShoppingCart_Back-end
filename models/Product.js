const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    image:{
        type: String, 
        required: true,
    },
    name: {
        type: String, 
        required: true, 
    },
    informations:{
        operatingSystem: String,
        hardDiskCapacity: Number,
        processorFamily:  String,
        screenSize:  String,
        memorySize:Number
    },
    price:{
        type: Number,
        required: true
    }
})


module.exports= mongoose.model('Product',productSchema);