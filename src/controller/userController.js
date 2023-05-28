const userModel = require("../models/userModel.js");
const counterModel = require("../models/counterModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  isValidStatus,
  isValidPassword,
  isValidInputValue,
  isValidEmail,
  isValidRequestBody,
  isValidOnlyCharacters,
  isValidPhone,
  isValidCountryCode,
} = require("../validations/validation.js");

const registerUser = async (req, res) => {
  try {
    let body = req.body;

    let {
      name,
      user_name,
      country_code,
      mobile,
      email_id,
      password,
      statuss,
    } = req.body;

    if (!isValidOnlyCharacters(name))
      return res.status(400).send({status : false, message : "Name can only be alphabetical"});

    const notUniqueUserName = await userModel
      .findOne({ user_name })
      .collation({ locale: "en", strength: 2 });
    if (notUniqueUserName)
      return res.status(400).send({status : false, message :"User Name already exist"});

    if (!isValidCountryCode(country_code))
      return res.status(400).send({status : false, message :"Please provide right Country Code"});

    if (!isValidPhone(mobile))
      return res.status(400).send({status : false, message :"Please provide correct mobile number"});
    let user = await userModel.findOne({ mobile: mobile });
    if (user) return res.status(400).send({status : false, message :"This Mobile number already exist"});

    if (!isValidInputValue(email_id) || !isValidEmail(email_id)) {
      return res
        .status(400)
        .send({status : false, message :"email address should be a valid email address"});
    }

    const notUniqueEmail = await userModel
      .findOne({ email_id })
      .collation({ locale: "en", strength: 2 });

    if (notUniqueEmail)
      return res.status(400).send({status : false, message :"Email address already exist"});

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .send({
          status : false, message :"Password should be of min 8 characters, must have atleast 1 number, 1st character should be capital and min 1 special charater"
    });
    }

    const saltRounds = 10;
    let encryptedPassword = bcrypt
      .hash(body.password, saltRounds)
      .then((hash) => {
        console.log(`Hash: ${hash}`);
        return hash;
      });

    let pass = await encryptedPassword;

    body.password = pass;

    if (!isValidStatus(statuss))
      return res.status(400).send({status : false, message :"Please provide right Status"});

    let check = await counterModel.findOneAndUpdate(
      { user_id: "autoval" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    // autoincrement -----------
    let seqId;
    if (check === null) {
      let data = { user_id: "autoval", seq: 1 };
      await counterModel.create(data);
      seqId = 1;
    } else {
      seqId = check.seq;
    }
    //---------------------
    body.user_id = seqId;
    let savedData = await userModel.create(body);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: savedData,
    });
  } catch (err) {
    return res.status(500).send({status : false, message :err.message});
  }
};

const loginUser = async (req, res) => {
  try {
    let data = req.body;
    let { email_id, password } = data;

    if (!isValidRequestBody(data))
      return res
        .status(400)
        .send.status(400)
        .send.status(400)
        .send("User data is required for login");
    if (!isValidInputValue(email_id) || !isValidEmail(email_id)) {
      return res
        .status(400)
        .send({status : false, message :"Email is required and should be a valid email"});
    }
    if (!isValidInputValue(password))
      return res.status(400).send({status : false, message :"Password is required "});

    let hash = await userModel
      .findOne({ email_id: email_id })
      .collation({ locale: "en", strength: 2 });

    if (hash == null) return res.status(400).send({status : false, message :"Email does not exist"});

    let compare = await bcrypt.compare(password, hash.password).then((res) => {
      return res;
    });

    if (!compare) return res.status(400).send({status : false, message :"Incorrect Password"});

    const token = jwt.sign(
      {
        user_name: hash.user_name,
        status: hash.statuss,
      },
      "wowTalent-Assignment",
      { expiresIn: "10hr" }
    );

    res.header("Authorization", "Bearer : " + token);
    return res.status(200).send({
      status: true,
      token,
      msg: "User logged in successfully",
      data: { message: ` welcome👽👽 ${hash.name}` },
    });
  } catch (err) {
    return res.status(500).send({status : false, message :err.message});
  }
};

const followUser = async (req, res) => {
  try {
    let userId = req.params.userId;

    let user = await userModel.findOne({ user_id: userId });
    if (!user) return res.status(400).send({status : false, message :"User does not exist"});
    console.log(req.userName, user.user_name);
    if (req.userName !== user.user_name)
      return res.status(400).send({status : false, message :"Not Authorized"});

    let followId = req.body.follow_id; // follow_id is another person user_id
    if (!followId)
      return res.status(400).send({status : false, message :"Please provide followId to follow"});
    if (userId == followId) return res.status(400).send({status : false, message :"Not Allowed!"});

    const followers = await userModel.findOneAndUpdate(
      { user_id: followId },
      { $addToSet: { followers: userId }, $inc: { followerCount: 1 } },
      { new: true }
    );
    if (!followers)
      return res
        .status(404)
        .send({ status: false, message: "follower profile doesn't exists" });

    const followings = await userModel.findOneAndUpdate(
      { user_id: userId },
      { $addToSet: { following: followId }, $inc: { followingCount: 1 } },
      { new: true }
    );
    if (!followings)
      return res
        .status(404)
        .send({ status: false, message: "userId  doesn't exists" });

    return res.status(200).send({ msg: "Followed" });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    let userId = req.params.userId;

    let user = await userModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(400).send("User does not exist");
    }

    if (req.userName !== user.user_name) {
      return res.status(400).send("Not Authorized");
    }
    let unFollowId = req.body.unFollow_id;

    if (!unFollowId) {
      return res.status(400).send("Please provide userid to follow");
    }

    if (userId == unFollowId) return res.status(400).send(" Not Allowed!");

    const followList = await userModel.findOne({ user_id: userId });
    let followerArr = followList.following;
    if (!followerArr.includes(unFollowId) || !followerArr.length) {
      return res.status(400).send("You are not following this user");
    }

    const newArr = [...followerArr].filter((f) => f !== unFollowId);
    followList.following = newArr;
    followList.followingCount = followList.followingCount - 1;
    followList.save();

    return res.status(200).send({ msg: "Unfollow done" });
  } catch (err) {
    res.status(500).send({ status: false, message: "err.Message" });
  }
};

const updateUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    let userDetail = await userModel.findOne({ user_id: userId });
    if (!userDetail) {
      return res.status(400).send("User does not exist");
    }

    if (req.userName !== userDetail.user_name) {
      return res.status(400).send("Not Authorized");
    }

    let data = req.body;

    if (data["name"]) {
      if (!isValidOnlyCharacters(data["name"])) {
        return res.status(400).send("Name can only be alphabetical");
      }
    }

    if (data["user_name"]) {
      let user = await userModel.findOne({ user_name: data["user_name"] });
      if (user) {
        return res.status(400).send("User Name already exist");
      }
    }
    if (data["email_id"]) {
      return res.status(400).send("Email can't be updated");
    }
    if (data["password"]) {
      return res.status(400).send("Password can't be updated");
    }

    if (data["country_code"]) {
      if (!isValidCountryCode(data["country_code"])) {
        return res.status(400).send("Please provide right Country Code");
      }
    }

    const userUpdate = await userModel.findOneAndUpdate(
      { user_id: userId },
      data,
      {
        new: true,
      }
    );
    return res
      .status(200)
      .send({ status: true, message: "Updated", data: userUpdate });
  } catch (err) {
    res.status(500).send({ status: false, message: "err.Message" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  followUser,
  unfollowUser,
  updateUser,
};
