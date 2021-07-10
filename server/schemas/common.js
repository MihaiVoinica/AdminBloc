const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BillSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "splitOnPeopleCount",
        "splinOnShare",
        "splinOnConsumption",
        "splinOnRadiant",
      ],
    },
    value: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const MeterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    prevValue: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      default: 0,
    },
    consumption: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = {
  BillSchema,
  MeterSchema,
};
