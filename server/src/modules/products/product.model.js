const mongoose = require('mongoose');

// ProductImages/ProductVideos are embedded (not separate top-level
// collections) since they are always read/written together with the
// product and rarely queried independently - a deliberate Embed choice per
// the ERD's "normalize + embed where it optimizes reads" guidance.
const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    shortDescription: { type: String },

    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },

    images: [mediaSchema],
    videos: [mediaSchema],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],

    affiliateLink: { type: String, required: true },
    commissionType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    commissionValue: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },

    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isHot: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
