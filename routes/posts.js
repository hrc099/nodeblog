var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk')('localhost/nodeblog');
var multer = require('multer');
var upload = multer({ dest: './public/images/uploads' });

router.get('/add', function(req, res, next) {
    var db = req.db;
    var categories = db.get('categories');
    categories.find({}, {}, function(err, categories) {
        res.render('addpost',{
            'title': 'Add post',
            'categories': categories
        });
    });
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
    var db = req.db;
    // Get form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    if(req.file.mainimage) {
        var mainImageOriginalName = req.file.mainimage.originalname;
        var mainImageName = req.file.mainimage.name;
        var mainImageMime = req.file.mainimage.mimetype;
        var mainImagePath = req.file.mainimage.path;
        var mainImageExt = req.file.mainimage.extension;
        var mainImageSize = req.file.mainimage.size;
    } else {
        var mainImageName = 'noimage.jpg';
    }

    // Form validation
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body field is required');

    // Check errors
    var errors = req.validationErrors();

    if(errors) {
        res.render('addpost', {
            'errors': errors,
            'title': title,
            'body': body
        });
    } else {
        var posts = db.get('posts');
        // Submit to DB
        posts.insert({
            'title': title,
            'body': body,
            'category': category,
            'date': date,
            'author': author,
            'mainimage': mainImageName
        }, function(err, post) {
            if(err) {
                res.send('There was an issue submitting the post');
            } else {
                req.flash('success', 'Post submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;