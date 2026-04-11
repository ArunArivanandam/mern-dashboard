const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.filterSenior = (req, res, next) => {
  req.filterOverride = { age: { $gte: 50 } };
  next();
};

exports.getAllUsers = async (req, res) => {
  const start = Date.now();
  //Filtering
  const excludedFields = ["sort", "page", "limit", "fields"];
  let queryObj = {};
  for (const field in req.query) {
    if (excludedFields.includes(field)) continue;
    if (
      typeof req.query[field] === "object" &&
      !Array.isArray(req.query[field])
    ) {
      queryObj[field] = {};
      for (const op in req.query[field]) {
        queryObj[field][`$${op}`] = Number(req.query[field][op]);
      }
    } else {
      queryObj[field] = req.query[field];
    }
  }
  // Merge any hard filters set by alias middlewares (e.g. filterSenior)
  if (req.filterOverride) {
    Object.assign(queryObj, req.filterOverride);
  }

  let query = User.find(queryObj);
  const filteredCount = await User.countDocuments(queryObj);

  // 🔃 Sorting
  if (req.query.sort) {
    const sortKey = req.query.sort.split(",").join(" ");
    query = query.sort(sortKey);
  } else {
    query = query.sort("-createdAt");
  }

  // 🎯 Field selection
  if (req.query.fields) {
    const showFields = req.query.fields.split(",").join(" ");
    query = query.select(showFields);
  } else {
    query = query.select("-__v");
  }

  // 📄 Pagination
  if (req.query.page && req.query.limit) {
    const page = req.query.page * 1;
    const limit = req.query.limit * 1;

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (filteredCount <= skip) {
      return res.status(200).json({
        message: "Invalid page number",
      });
    }
  }

  const users = await query;
  const end = Date.now();
  console.log("controller", end - start);
  res.json({
    total: filteredCount,
    data: users,
  });
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

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isAuthenticated = await user.comparePassword(
      `${password}`,
      user.password,
    );
    console.log(isAuthenticated);

    if (!isAuthenticated) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json(isAuthenticated);
  } catch (error) {
    res.status(400);
    console.log("Error at user login", error.message);
  }
};

exports.getUsersAggregation = async (req, res) => {
  try {
    const data = await User.aggregate([
      // {
      //   $match: { age: { $gt: 60 } },
      // },
      {
        $group: {
          _id: "$role",
          min: { $min: "$age" },
          max: { $max: "$age" },
          avg: { $avg: "$age" },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { avg: -1 },
      },
    ]);

    res.json(data);
  } catch (error) {
    console.log("Aggregation error", error.message);
  }
};
