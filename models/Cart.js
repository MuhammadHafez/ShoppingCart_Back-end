const mongoose = require('mongoose');



const cartSchema = mongoose.Schema({
    
    _id: String,

    products: {
        type: Array,
        required: true,
    },
    totalQuantity:{
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});



module.exports= mongoose.model('Cart', cartSchema);