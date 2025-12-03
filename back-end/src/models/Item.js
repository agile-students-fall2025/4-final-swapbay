import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'Misc' },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Used'],
      default: 'Good',
    },
    description: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
      index: true,
    },
    offerType: {
      type: String,
      enum: ['money', 'swap', 'both'],
      default: 'both',
    },
    available: { type: Boolean, default: true },
    unavailableReason: { type: String, default: null },
  },
  { timestamps: true },
);

itemSchema.index({ title: 'text', description: 'text', category: 'text' });
itemSchema.index({ status: 1, available: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;
