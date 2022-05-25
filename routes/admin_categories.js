const   express     = require('express'),
        router      = express.Router(),
        Category    = require('../models/category');

router.get('/',function(req, res){
    Category.find(function(err, categories){
        if(err) return console.log(err);
        res.render('admin/categories.ejs', {
            categories: categories
        });
    });
});

router.get('/add-category', function(req, res){
    let title = "";
    res.render('admin/add_category.ejs', {       
        title: title
    });
});

router.post('/add-category', function(req, res){
    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    
    let content = req.body.content;

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/add_category.ejs', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({slug: slug}, function(err, category){
            if(category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add_category.ejs', {
                    title: title
                });
            } else {
                let category = new Category ({
                    title: title,
                    slug: slug
                });

                category.save(function(err){
                    if(err) 
                        return console.log(err);
                    
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});

router.get('/edit-category/:id', function(req, res){
    Category.findById(req.params.id, function(err, category){
        if(err)
            return console.log(err);
        
        res.render('admin/edit_category.ejs', {
            title: category.title,
            id: category._id
        });
    });
});

router.post('/edit-category/:id', function(req, res){
    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_category.ejs', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne':id}}, function(err, category){
            if(category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category.ejs', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function(err, category){
                    if(err)
                        return console.log(err);
                                         
                    category.title = title;
                    category.slug = slug;

                    category.save(function(err){
                        if(err)
                            return console.log(err);
                                             
                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/categories/edit-category/'+id);
                    });
                });
            }
        });
    }
});

router.get('/delete-category/:id',function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err)
            return console.log(err);
        
        req.flash('success', 'Category deleted!');
        res.redirect('/admin/categories/');
    });
});

module.exports = router;