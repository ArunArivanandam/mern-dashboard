// ============================================================
// 🌱 seedDB.js — Bulk Product Seeder
// ============================================================
// Usage:
//   node seedDB.js --import    → Insert 50 products into DB
//   node seedDB.js --delete    → Wipe all products from DB
//   node seedDB.js --refresh   → Wipe then re-import
//
// Set your MONGO_URI in a .env file or as an env variable.
// ============================================================

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/productModel"); // adjust path if needed
const User = require("./models/userModel"); // needed to resolve seller IDs
const products = require("./products.seed");

const MONGO_URI =
  process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/yourdbname";

// ─── Connect ────────────────────────────────────────────────
async function connect() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  MongoDB connected:", mongoose.connection.host);
}

// ─── Resolve Seller IDs ─────────────────────────────────────
// Replaces placeholder ObjectIds with real seller IDs from the
// DB. Picks from the first 3 "user"-role accounts it finds.
async function resolveSellerIds(docs) {
  const realSellers = await User.find({ role: "user" })
    .select("_id")
    .limit(3)
    .lean();

  if (realSellers.length === 0) {
    console.warn(
      "⚠️  No users found in DB. Products will be inserted with placeholder seller IDs.\n" +
        "   Run after creating at least one user, or update seller IDs manually.",
    );
    return docs;
  }

  return docs.map((doc, i) => ({
    ...doc,
    seller: realSellers[i % realSellers.length]._id,
  }));
}

// ─── Slug Utility ───────────────────────────────────────────
// The pre-save hook generates slugs automatically, but
// insertMany bypasses middleware — so we do it here too.
function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function attachSlugs(docs) {
  return docs.map((doc) => ({
    ...doc,
    slug: toSlug(doc.name),
  }));
}

// ─── Import ─────────────────────────────────────────────────
async function importData() {
  try {
    let docs = await resolveSellerIds(products);
    docs = attachSlugs(docs);

    // insertMany with ordered:false continues even if a few docs fail
    const result = await Product.insertMany(docs, { ordered: false });
    console.log(`✅  ${result.length} products inserted successfully.`);
  } catch (err) {
    // BulkWriteError still reports how many succeeded
    if (err.insertedDocs) {
      console.log(
        `⚠️  Partial insert: ${err.insertedDocs.length} products inserted.`,
      );
    }
    console.error("❌  Import error:", err.message);
  }
}

// ─── Delete ─────────────────────────────────────────────────
async function deleteData() {
  try {
    const result = await Product.deleteMany({});
    console.log(`🗑️   ${result.deletedCount} products deleted.`);
  } catch (err) {
    console.error("❌  Delete error:", err.message);
  }
}

// ─── Main ───────────────────────────────────────────────────
(async () => {
  const arg = process.argv[2];

  if (!["--import", "--delete", "--refresh"].includes(arg)) {
    console.log("Usage: node seedDB.js --import | --delete | --refresh");
    process.exit(1);
  }

  await connect();

  if (arg === "--import") await importData();
  if (arg === "--delete") await deleteData();
  if (arg === "--refresh") {
    await deleteData();
    await importData();
  }

  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB.");
  process.exit(0);
})();
