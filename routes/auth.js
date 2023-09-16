const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated, isAdmin } = require("../middlewares/jwt");
const saltRounds = 10;

// @desc SIGN UP new user
// @route POST /auth/signup
// @access Public
router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  if (email === "" || password === "" || username === "") {
    res.status(400).json({ message: "Please fill all the fields to register" });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res
      .status(400)
      .json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter",
      });
    return;
  }

  try {
    const userInDb = await User.findOne({ email });
    if (userInDb) {
      res.status(400).json({ message: "User already exists" });
      return;
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newUser = await User.create({
        email,
        hashedPassword,
        username,
      });
      res.status(201).json({ data: newUser });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: `An error occurred creating a new user: ${error}` });
  }
});

// @desc LOG IN user
// @ POST auth/login
// @access Public

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    // const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
    //   usernameOrEmail
    // );
    // const key = isEmail ? "email" : "username";

  if (email === "" || password === "") {
    res.status(400).json({ message: "Please fill all the fields to login" });
    return;
  }
  try {
    const userInDb = await User.findOne({ email });
    if (!userInDb) {
      res.status(404).json({
        success: false,
        message: `No user registered by ${email}`,
      });
      return;
    } else {
      const passwordMatches = bcrypt.compareSync(
        password,
        userInDb.hashedPassword
      );
      if (passwordMatches) {
        const payload = {
          email: userInDb.email,
          username: userInDb.username,
          role: userInDb.role,
          _id: userInDb._id,
        };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "30d",
        });
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate user" });
      }
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: `An error occurred authenticating a user: ${error}` });
  }
});

module.exports = router;
