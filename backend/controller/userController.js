const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

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
    // console.log(req.headers);

    if (!req.isAdmin && req.userId !== req.params.id) {
      return res.status(400).send("Not authorized");
    }

    const user = await User.findById(req.params.id);
    if (req.tokenVersion !== user.tokenVersion) {
      res
        .status(400)
        .send("Already logged Out. Please login again to continue");
    } else {
      res.json(user);
    }
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

exports.signOut = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    Object.assign(user, { tokenVersion: user.tokenVersion + 1 });
    await user.save();
    res.json({ message: "Successfully LoggedOut" });
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
    // console.log(email);
    const user = await User.findOne({ email }).select("+password");
    // console.log(user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isAuthenticated = await user.comparePassword(
      `${password}`,
      user.password,
    );
    console.log(isAuthenticated);

    if (!isAuthenticated) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, tokenVersion: user.tokenVersion }, // payload
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3m" },
    );

    console.log(token);
    // 4. Send token
    res.json({ token });
  } catch (error) {
    res.status(400);
    console.log("Error at user login", error.message);
  }
};

exports.isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log(token);
  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
    req.userId = decoded.id;
    req.isAdmin = decoded.role === "admin";
    req.tokenVersion = decoded.tokenVersion;
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
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
