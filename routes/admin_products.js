const   express     = require('express'),
        router      = express.Router(),
        mkdirp      = require('mkdirp'),
        fs          = require('fs-extra'),
        resizeImg   = require('resize-img'),
        Product     = require('../models/product'),
        Category    = require('../models/category');

router.get('/',function(req, res){
    let count;

    Product.count(function(err, c){
        count = c;
    });
    Product.find(function(err, products){
        res.render('admin/products.ejs', {
            products: products,
            count: count
        });
    });
});

router.get('/add-product', function(req, res){
    let title = "";
    let desc = "";
    let price = "";

    Category.find(function(err, categories){
        res.render('admin/add_product.ejs', {       
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
    
});

router.post('/add-product', function(req, res){
    let imageFile;
    if(!req.files){ imageFile =""; }
    if(req.files){
        imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    } 

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image.').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

    let errors = req.validationErrors();

    if(errors){
        Category.find(function(err, categories){
            res.render('admin/add_product.ejs', {    
                errors: errors,   
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function(err, product){
            if(product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function(err, categories){
                    res.render('admin/add_product.ejs', {    
                        errors: errors,   
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);

                let product = new Product ({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function(err){
                    if(err) 
                        return console.log(err);
                    
                    mkdirp('public/product_images/'+product._id, function(err){
                        return console.log(err);
                    });
                    mkdirp('public/product_images/'+product._id+'/gallery', function(err){
                        return console.log(err);
                    });
                    mkdirp('public/product_images/'+product._id+'gallery/thumbs', function(err){
                        return console.log(err);
                    });

                    if(imageFile !== ""){
                        let productImage = req.files.image;
                        let path = 'public/product_images/'+product._id+'/'+imageFile;

                        productImage.mv(path, function(err){
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }
});

router.get('/edit-product/:id', function(req, res){

    let errors;

    if(req.session.errors) errors=req.session.errors;
    req.session.errors - null;
    
    Category.find(function(err, categories){

        Product.findById(req.params.id, function(err, p){
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } else {
                let galleryDir = 'public/product_images/' + p._id + '/gallery';
                let galleryImages = null;

                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product.ejs', {    
                            errors: errors,   
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });

        
    });
});

router.post('/edit-product/:id', function (req, res) {

    let imageFile = "";
    if(req.files){
        imageFile = req.files.image.name;
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            let productImage = req.files.image;
                            let path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});
router.post('/product-gallery/:id',function(req, res){
    let productImage = req.files.file;
    let id = req.params.id;
    let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    let thumbsPath = 'public/product_images/' + id +'/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err){
        if(err)
            console.log(err);  

        // resizeImg(fs.readFileSync(path), {width: 100, height: 100}),then(function(buf) {
        //     fs.writeFileSync(thumbsPath, buf);
        // });
    });
    res.sendStatus(200);
});

router.get('/delete-image/:image',function(req, res){
    let originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    let thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err){
        if(err){
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err){
                if(err){
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

router.get('/delete-product/:id', function (req, res) {

    let id = req.params.id;
    let path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});
module.exports = router;