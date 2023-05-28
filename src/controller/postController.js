const postModel = require("../models/postModel.js");
const userModel = require("../models/userModel.js");
const {
  isValidObjectId,
  isValidStatus,
  isValidInputValue,
  isValidRequestBody,
} = require("../validations/validation.js");


const postCreate = async function (req, res) {
  let userId = req.params.userId;
  let user = await userModel.findOne({ user_id: userId });

  if (!user) {
    return res
        .status(400)
        .send("User doesn't exist");
  }
  if (req.userName !== user.user_name) {
    return res
        .status(400)
        .send("Not Authorized");
  }
  let data = req.body;
  if (!isValidRequestBody(data)) {
    return res
        .status(400)
        .send("post details required");
  }



  let {  statuss, friendname } = data;


  if (!isValidInputValue(statuss) || !isValidStatus(statuss)) {
    return res
        .status(400)
        .send("Please provide right Status");
  }

  data.user_id = userId;


  let savedPost = await postModel.create(data);

  if (friendname) {
    console.log(friendname);
    let friend = await userModel.findOne({ user_name: friendname });
    if (!friend) {
        return res
        .status(400)
        .send("Friend doesn't exist");
    }

    savedPost.friendTag = friendname;
    savedPost.save();
  }

  user.postCount = user.postCount + 1;
  user.save();

  return res.status(201).send({
    status: true,
    message: "Post created successfully",
    data: savedPost,
  });
};

const likePost = async (req, res) => {
  let userId = req.params.userId;
  let { postId } = req.body;

  const userCheck = await userModel.findOne({ user_id: userId });
  if (!userCheck) {
    return res
        .status(400)
        .send(`${userId} not exist`);
  }
  if (req.userName !== userCheck.user_name) {
    return res.status(400).send({
      status: false,
      message: "Not Authorized",
    });
  }

  // check postId
  if (!postId) {
    return res
      .status(400)
      .send({ status: false, message: "plz provide postId" });
  }
  if (!isValidObjectId(postId)) {
    return res
      .status(400)
      .send({ status: false, message: " invalid PostId ಥ_ಥ" });
  }
  const checkPostId = await postModel.findOne({ _id: postId });

  if (!checkPostId) {
    return res
      .status(400)
      .send({ status: false, message: `${postId} is not present` });
  }

  let liked = checkPostId["likedBy"].includes(userId);
  if (liked) {
    res
      .status(400)
      .send({
        status: false,
        message: "you have already liked the post ¯_(ツ)_/¯",
      });
  }
  await postModel.findByIdAndUpdate(
    postId,
    {
      $addToSet: { likedBy: userId },
      $inc: { likes: 1 },
    },
    { new: true }
  );

  return res
    .status(200)
    .send({ status: true, message: "succesfully ❤ the post (★‿★)" });
};




const getList = async (req, res) => {
  try {
    let userId = req.params.userId
    let user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }

    let page = req.query.page;


    let posts = await postModel.find({ statuss: "Public" }).sort({ "createdAt": 'desc' }).skip((page - 1) * 10).limit(10)
    if (posts.length == 0) {
      return res.status(400).send({
        status: false,
        message: "No more posts available",
      });
    }

    posts.forEach(ele => {
      let isLiked = false;
      if (ele.likedBy.includes(userId)) {
        isLiked = true
      }
      Object.assign(ele._doc, { "isLiked": isLiked });
    })
  

    return res.status(200).send({ status: true, data: posts })
  }
  catch (err) {
    res.status(500).send({ status: false, message: "err.Message" });
  }
}

const getMyLikedList = async (req, res) => {
  try {
    let userId = req.params.userId
    let user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }

    let posts = await postModel.find().where("user_id").ne(userId)
    if (posts.length == 0) {
      return res.status(400).send({
        status: false,
        message: "No more posts available",
      });
    }
    let isLiked = []
    posts.forEach(ele => {
      if (ele.likedBy.includes(userId)) {
        isLiked.push(ele)
      }
    })
  
    return res.status(200).send({ status: true, data: isLiked })
  }
  catch (err) {
    res.status(500).send({ status: false, message: "err.Message" });
  }
}

const updatePost = async (req, res) => {
  try {
    let userId = req.params.userId;
    let user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }

    if (req.userName !== user.user_name) {
      return res.status(400).send({
        status: false,
        message: "Not Authorized",
      });
    }
    let postId = req.params.postId;

    if (!postId) {
      return res
        .status(400)
        .send({ status: false, message: "plz provide postId" });
    }
    if (!isValidObjectId(postId)) {
      return res
        .status(400)
        .send({ status: false, message: " invalid PostId ಥ_ಥ" });
    }
    const post = await postModel.findOne({
      _id: postId,
      user_id: userId,
      isDeleted: false,
    });
    if (!post) {
      return res
        .status(404)
        .send({ status: false, message: "Post Does not exist" });
    }

    let data = req.body;

    const postUpdate = await postModel.findOneAndUpdate({ _id: postId }, data, {
      new: true,
    });
    console.log(postUpdate); 
    return res
      .status(200)
      .send({ status: true, message: "Updated", data: postUpdate });
  } catch (err) {
    res.status(500).send({ status: false, message: "err.message" });
  }
};

const deletePosts = async (req, res) => {
  const postId = req.params.postId;
    const userId = req.params.userId;
    let user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }
  
    if (req.userName !== user.user_name) {
      return res.status(400).send({
        status: false,
        message: "Not Authorized",
      });
    }

    if (!isValidObjectId(postId)) {
        return res
          .status(400)
          .send({ status: false, message: " invalid PostId ಥ_ಥ" });
    }
    
  const post = await postModel.findOne({
    _id: postId,
    user_id: userId,
    isDeleted: false,
  });
  if (!post) {
    return res
      .status(404)
      .send({ status: false, message: "Post Does not exist" });
  }

  await postModel.findOneAndUpdate(
    { _id: postId },
    { $set: { isDeleted: true }, deletedAt: Date.now() },
    { new: true }
  );

  return res.status(200).send({ msg: "Post Deleted Successfully" });
};

module.exports = { postCreate, likePost, getList, getMyLikedList, updatePost, deletePosts };