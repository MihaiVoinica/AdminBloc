const mongoose = require("mongoose");
const { MeterSchema, BillSchema } = require("./common");

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

// Create Schema
const ApartmentSchema = new Schema(
  {
    userId: {
      // the user that owns the apartment
      type: ObjectId,
      required: false,
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
    number: {
      type: Number,
      required: true,
    },
    peopleCount: {
      type: Number,
      default: 0,
    },
    totalArea: {
      type: Number,
      required: true,
    },
    radiantArea: {
      type: Number,
      required: true,
    },
    share: {
      type: Number,
      required: true,
    },
    thermalProvider: {
      type: Boolean,
      required: true,
    },
    meters: {
      type: [MeterSchema],
      default: [],
    },
    bills: {
      type: [BillSchema],
      default: [],
    },
    pastBills: {
      type: [BillSchema],
      default: [],
    },
    payments: {
      type: [Number],
      default: [],
    },
    remainingCost: {
      type: Number,
      default: 0,
    },
    currentCost: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("apartments", ApartmentSchema);
