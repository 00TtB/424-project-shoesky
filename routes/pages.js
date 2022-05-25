const   express = require('express'),
        router  = express.Router(),
        Product = require('../models/product'),
        Page = require('../models/page');

router.get('/', function(req, res){
    Page.findOne({slug: 'home'}, function(err, page){
        if(err)
            console.log(err);

        res.render('index.ejs', {
            title: page.title,
            content: page.content
        });       
    });
});

router.get('/search', function(req, res){
    let word = req.query.search;

    Product.find({"title" : {"$regex" : word, $options:'i'}}, function(err, find){
        if(err){
            console.log(err);
        } else {
            res.render('searchpage.ejs', {find: find});
            console.log(find);
        }
    });
});

router.get('/:slug', function(req, res){
    let slug = req.params.slug;

    Page.findOne({slug: slug}, function(err, page){
        if(err)
            console.log(err);
        if(!page){
            res.redirect('/');
        } else {
            res.render('index.ejs', {
                title: page.title,
                content: page.content
            });
        }
    });
});

module.exports = router;