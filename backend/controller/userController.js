const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  let query = User.find();
  const count = await User.countDocuments();

  if (req.query.sort) {
    const sortKey = req.query.sort.split(",").join(" ");
    console.log(sortKey);
    query = query.sort(sortKey);
  }

  if (req.query.fields) {
    const showFields = req.query.fields.split(",").join(" ");
    query = query.select(showFields);
  } else {
    query = query.select("-__v");
  }

  if (req.query.page && req.query.limit) {
    const page = req.query.page * 1;
    const limit = req.query.limit * 1;

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (count <= skip) {
      return res.status(200).json({
        message: "Invalid page number",
      });
    }
  }

  const users = await query;

  res.json(users);
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.status(400);
    console.log("Error at creating user", error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(400);
    console.log("Error at getting a particular user", error.message);
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
    console.log("Error at updating a particular user", error.message);
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
    console.log("Error at deleting a particular user", error.message);
  }
};
