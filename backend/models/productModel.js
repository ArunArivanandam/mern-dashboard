const mongoose = require("mongoose");

// -----------------------------
// Review Sub-Schema
// -----------------------------
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment must be under 500 characters"],
    },
  },
  { timestamps: true },
);

// -----------------------------
// Product Schema
// -----------------------------
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name must be under 100 characters"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be under 2000 characters"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },

    discountPrice: {
      type: Number,
      min: [0, "Discount price must be a positive number"],
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price must be less than the original price",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "electronics",
          "clothing",
          "food",
          "books",
          "furniture",
          "other",
        ],
        message: "Invalid category",
      },
      lowercase: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "A product can have at most 5 images",
      },
      default: [],
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },

    reviews: {
      type: [reviewSchema],
      select: false, // 🔐 load explicitly when needed
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// -----------------------------
// 🔒 PRE-SAVE MIDDLEWARE
// -----------------------------
productSchema.pre("save", function (next) {
  // Auto-generate slug from name if not provided or name changed
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

productSchema.pre("find", function () {
  this._startTime = Date.now();
  this.where({ isActive: true }); // only return active products by default
});

productSchema.post("find", function () {
  console.log("query time (ms):", Date.now() - this._startTime);
});

// -----------------------------
// 📊 VIRTUALS
// -----------------------------
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / this.reviews.length).toFixed(1);
});

productSchema.virtual("isOnSale").get(function () {
  return this.discountPrice != null && this.discountPrice < this.price;
});

productSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice ?? this.price;
});

// -----------------------------
// 🔐 REMOVE SENSITIVE FIELDS
// -----------------------------
productSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.reviews; // load explicitly via .select("+reviews")
    return ret;
  },
});

// -----------------------------
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
