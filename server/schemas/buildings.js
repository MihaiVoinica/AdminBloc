const mongoose = require("mongoose");
const { BillSchema } = require("./common");

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

// Create Schema
const BuildingSchema = new Schema(
  {
    userId: {
      // the user that manages the building
      type: ObjectId,
      required: false,
      ref: "users",
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    apartmentsCount: {
      type: Number,
      required: true,
    },
    bills: {
      type: [BillSchema],
      default: [],
    },
    pastUserIds: {
      // the user that owns the apartment
      type: [ObjectId],
      required: false,
      default: [],
      ref: "users",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("buildings", BuildingSchema);
