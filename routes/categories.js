var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

// Homepage blog posts
router.get('/add', function(req, res, next) {
    res.render('addcategory', {
        'title': 'Add category'
    });
});

router.post('/add', function(req, res, next) {
    var db = req.db;
    // Get form values
    var title = req.body.title;

    // Form validation
    req.checkBody('title', 'Title is required').notEmpty();

    // Check errors
    var errors = req.validationErrors();

    if(errors) {
        res.render('addcategory', {
            'errors': errors,
            'title': title
        });
    } else {
        var posts = db.get('categories');
        // Submit to DB
        categories.insert({
            'title': title
        }, function(err, category) {
            if(err) {
                res.send('There was an issue submitting the category');
            } else {
                req.flash('success', 'Category submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;