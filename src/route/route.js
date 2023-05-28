const express = require('express');
const route = express.Router();
const {authentication} = require('../middleware/authentication.js')
const { registerUser, loginUser, followUser, unfollowUser, updateUser } = require('../controller/userController.js')
const { postCreate, likePost, getList, getMyLikedList, updatePost, deletePosts } = require('../controller/postController.js')
const { createComment, createSubComment } = require('../controller/commentController.js')

// 
route.get("/", (req, res) => {
    res.send("Hello World");
})

//------------------------user----------------------------
route.post("/register", registerUser);
route.post("/login", loginUser);
route.put("/updateUser/:userId", authentication, updateUser)
route.put('/follow/:userId', authentication ,followUser);
route.patch('/unFollow/:userId', authentication ,unfollowUser)

// //------------------------post----------------------------
route.post("/createPost/:userId", authentication , postCreate)
route.patch("/likePost/:userId", authentication, likePost)
route.get("/getList/:userId", authentication, getList)
route.get("/getMyLikedList/:userId", authentication, getMyLikedList)
route.put("/updatePost/user/:userId/post/:postId", authentication , updatePost)
route.delete("/deletePost/user/:userId/post/:postId", authentication ,deletePosts)

// //----------------------comment--------------------------
route.post("/createComment/user/:userId/post/:postId", authentication , createComment);

// //-----------------------sub-comment--------------------
route.post("/createSubComment/user/:userId/comment/:commentId", authentication , createSubComment);

module.exports = route;