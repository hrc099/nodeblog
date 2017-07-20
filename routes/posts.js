var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk')('localhost/nodeblog');
var multer = require('multer');
var upload = multer({ dest: './public/images/uploads' });

router.get('/show/:id', function(req, res, next) {
    console.log(req.params);
    var posts = monk.get('posts');
    posts.findOne({ _id: req.params.id }, function(err, post) {
        res.render('show',{
            'post': post
        });
    });
});

router.get('/add', function(req, res, next) {
    var categories = monk.get('categories');
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
    var name = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    if(req.file) {
        var mainImageOriginalName = req.file.originalname;
        var mainImageName = req.file.filename;
        var mainImageMime = req.file.mimetype;
        var mainImagePath = req.file.path;
        var mainImageExt = req.file.extension;
        var mainImageSize = req.file.size;
    } else {
        var mainImageName = 'noimage.jpg';
    }

    // Form validation
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check errors
    var errors = req.validationErrors();

    if(errors) {
        var categories = db.get('categories');
        categories.find({}, {}, function(err, categories) {
            res.render('addpost',{
                'errors': errors,
                'title': title,
                'body': body,
                'categories': categories
            });
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

router.post('/addcomment', function(req, res, next) {
    // Get form values
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postId = req.body.postid;
    var commentDate = new Date();

    // Form validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not correct').isEmail();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check errors
    var errors = req.validationErrors();

    if(errors) {
        var posts = monk.get('posts');
        posts.findOne({ _id: postId }, function(err, post) {
            res.render('show',{
                'errors': errors,
                'post': post,
            });
        });
    } else {
        var comments = {'name': name, 'email': email, 'body': body, 'commentdate': commentDate};
        // Submit to DB
        monk.get('posts').update(
            {
                '_id': postId
            },
            { $push: {
                'comments': comments
            }}, function (err, doc) {
                if(err) {
                    throw err;
                } else {
                    req.flash('success', 'Comment added');
                    res.location('/posts/show/'+postId);
                    res.redirect('/posts/show/'+postId);
                }
            }
        );
    }
});

module.exports = router;