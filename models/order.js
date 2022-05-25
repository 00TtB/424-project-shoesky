const mongoose = require('mongoose');

let OrderSchema = mongoose.Schema({
    name: String,
    address: String,
    cardname: String,
    cardnum: String,
    expmonth: String,
    expyear: String,
    cvc: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

let Order = module.exports = mongoose.model('Order', OrderSchema);