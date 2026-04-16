const User = require("../models/sessionModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      data: users,
    });
  } catch (error) {
    res.status(400);
    console.log("Error at getting all session users", error.message);
  }
};

exports.registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const user = await User.create({ userName, email, password });
    req.session.userId = user._id; // start session immediately on signup
    res.status(201).json({ id: user._id, email: user.email });
  } catch (error) {
    res.status(400);
    console.log("Error at creating session user", error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(400);
    console.log("Error at getting a particular session user", error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    Object.assign(user, req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400);
    console.log("Error at updating a particular session user", error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400);
    console.log("Error at deleting a particular session user", error.message);
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPassword(password))) {
    // same message for both cases — no user enumeration
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Regenerate to prevent session fixation attacks
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Session error" });
    req.session.userId = user._id;
    res.json({ id: user._id, email: user.email });
  });
};

// // POST /api/auth/logout
// router.post("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     res.clearCookie("connect.sid");
//     res.json({ ok: true });
//   });
// });
