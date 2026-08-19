const mongoose = require('mongoose');

// Join collection between a KOL profile and the products they choose to
// showcase on their page. Kept as a Reference (not embedded) since KOLs can
// each pick many products and products can be picked by many KOLs -
// a genuine many-to-many relationship.
const kolProductSchema = new mongoose.Schema(
  {
    kol: { type: mongoose.Schema.Types.ObjectId, ref: 'KOLProfile', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    isPinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

kolProductSchema.index({ kol: 1, product: 1 }, { unique: true });
kolProductSchema.index({ kol: 1, isPinned: 1, order: 1 });

module.exports = mongoose.model('KOLProduct', kolProductSchema);
