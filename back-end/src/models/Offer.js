import mongoose from 'mongoose';

const swapSnapshotSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    condition: String,
    description: String,
    image: String,
  },
  { _id: false },
);

const offerSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offerType: {
      type: String,
      enum: ['money', 'swap', 'both'],
      default: 'money',
    },
    amount: { type: Number, min: 0, default: 0 },
    myItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    swapItemSnapshot: { type: swapSnapshotSchema, default: null },
    offeredFor: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Canceled'],
      default: 'Pending',
      index: true,
    },
    note: { type: String, default: '' },
    listingTitleSnapshot: { type: String, default: '' },
    listingOwnerUsernameSnapshot: { type: String, default: '' },
  },
  { timestamps: true },
);

offerSchema.index({ buyer: 1, listing: 1 });
offerSchema.index({ seller: 1, listing: 1 });
offerSchema.index({ listing: 1, status: 1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
