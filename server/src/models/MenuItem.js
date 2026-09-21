const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    icon: { type: String, trim: true, default: '' },
    route: { type: String, required: true, trim: true },
    permission: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    parentKey: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ order: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
