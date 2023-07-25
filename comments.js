// Create web server 

// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Comments = require('../models/comments');
const { response } = require('express');

// Create router
const commentRouter = express.Router();

// Use body-parser
commentRouter.use(bodyParser.json());

// Routes
commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => { // Get all comments
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // Post a comment
    if (req.body != null) {
        req.body.author = req.user._id;
        Comments.create(req.body)
        .then((comment) => {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    } else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // Put all comments
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { // Delete all comments
    Comments.remove({})
    .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, (err) => next(err))
    .catch((err) => next(err));
});

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next