const order = require('../models/order');

const   express = require('express'),
        router  = express.Router(),
        Order        = require('../models/order'),
        Product = require('../models/product');

router.get('/add/:product', function(req, res){
    let slug = req.params.product;
    Product.findOne({slug: slug}, function(err, p){
        if(err)
            console.log(err);

        if(typeof req.session.cart == "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            let cart = req.session.cart;
            let newItem = true;

            for(let i = 0; i < cart.length; i++){
                if(cart[i].title == slug){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if(newItem){
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }   
        console.log(req.session.cart);
        // req.flash('success', 'Product added!');
        res.redirect('back');   
    });
});

router.get('/checkout', function(req, res){
    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout.ejs', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

router.get('/update/:product', function(req, res){
    let slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;
    
    for(let i = 0; i < cart.length; i++){
        if(cart[i].title == slug){
            switch(action){
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i, 1);
                    break; 
                case "clear":
                    cart.splice(i, 1);
                    if(cart.length == 0) delete req.session.cart;
                    break;   
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }
    res.redirect('/cart/checkout');
});

router.get('/clear', function(req, res){
    delete req.session.cart;
    res.redirect('/cart/checkout');
});

router.get('/payment', function(req, res, next){
    if(!req.session.cart){
        return res.redirect('/cart/checkout');
    } else {
        
        res.render('payment.ejs', {cart: req.session.cart});
    }
       
    
});

router.post('/orders', function(req, res){
    Order.create({user:(req.user._id)}, function(err, newor){
        if(err){
            console.log(err);
        } else {
            newor.name = req.body.name;
            newor.address = req.body.address;
            newor.cardname = req.body.cardname;
            newor.cardnum = req.body.cardnum;
            newor.expmonth = req.body.expmonth;
            newor.expyear = req.body.expyear;
            newor.cvc = req.body.cvc;
            newor.save();

            res.redirect('/products');
        }
    });
});

router.get('/history', function(req, res, next){
    Order.find({user:(req.user._id)}, function(err, historyorder){
        if(err){
            console.log(err);
        } else {
            res.render('history.ejs', {cart: req.session.cart, order: historyorder});
        }
    });
});

router.get('/vieworder/:id', function(req, res, next){
    Order.findById(req.params.id, function(err, view){
        if(err){
            console.log(err);
        } else {
            res.render('detail.ejs', {cart: req.session.cart, order: view});
        }
    });
});

module.exports = router;