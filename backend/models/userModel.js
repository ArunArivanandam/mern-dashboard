const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// -----------------------------
// Security Question Schema
// -----------------------------
const securityQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    minlength: 2,
  },
});

// -----------------------------
// User Schema
// -----------------------------
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: 20,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    age: {
      type: Number,
      min: [13, "Age must be at least 13"],
      max: [100, "Age must be below 100"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // 🔐 never return by default
    },

    securityQuestions: {
      type: [securityQuestionSchema],
      validate: {
        validator: function (value) {
          return value.length === 3;
        },
        message: "Exactly 3 security questions are required",
      },
      select: false, // 🔐 hide answers
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// -----------------------------
// 🔐 PRE-SAVE MIDDLEWARE
// -----------------------------
userSchema.pre("save", async function () {
  // Hash password if changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Hash security answers if changed
  if (this.isModified("securityQuestions")) {
    for (let q of this.securityQuestions) {
      // prevent double hashing
      if (!q.answer.startsWith("$2b$")) {
        q.answer = await bcrypt.hash(q.answer, 10);
      }
    }
  }
});

userSchema.pre("find", function () {
  this._startTime = Date.now();
  this.where({ role: { $ne: "admin" } });
});

userSchema.post("find", function () {
  console.log("query time (ms):", Date.now() - this._startTime);
});

userSchema.virtual("fullName").get(function () {
  return `${this.userName} ${this.userName}`;
});
// -----------------------------
// 🔑 PASSWORD CHECK METHOD
// -----------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// -----------------------------
// 🔐 REMOVE SENSITIVE FIELDS
// -----------------------------
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.securityQuestions;
    return ret;
  },
});

// -----------------------------
const User = mongoose.model("User", userSchema);
module.exports = User;
