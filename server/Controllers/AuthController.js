const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }
    // DO NOT hash here, let the pre-save hook do it!
    const user = await User.create({ email, password, username });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    return res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};


module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.json({ message: "Incorrect password or email", success: false });
    }
    console.log("User found:", user);
    const auth = await bcrypt.compare(password, user.password);
    console.log("Password match:", auth);
    if (!auth) {
      return res.json({ message: "Incorrect password or email", success: false });
    }
     const token = createSecretToken(user._id);
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
     res.status(201).json({ message: "User logged in successfully", success: true });
     next()
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};