const express = require('express');

const Router = express.Router();

const feedController = require('../controllers/feed');


Router.get("/post", feedController.getPosts);
Router.post("/addPost", feedController.postPosts);

module.exports = Router;