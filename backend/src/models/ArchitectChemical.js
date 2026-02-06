const mongoose = require("mongoose");

const architectChemicalSchema = new mongoose.Schema(
  {
    architectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    chemicalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: ["kg", "Roll", "liter", "ml", "ton", "pcs"],
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCost: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

/* Auto-calculate total cost */
architectChemicalSchema.pre("save", function (next) {
  this.totalCost = this.quantity * this.rate;
  next();
});

module.exports = mongoose.model("ArchitectChemical", architectChemicalSchema);
