const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

// Create Schema
const FileSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "users",
    },
    buildingId: {
      type: ObjectId,
      required: true,
      ref: "buildings",
    },
    name: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("files", FileSchema);
