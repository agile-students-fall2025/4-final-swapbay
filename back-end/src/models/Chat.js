import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    sentAt: { type: Date, default: Date.now },
    readBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { _id: false },
);

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2,
        message: 'Chat must have exactly two participants.',
      },
      index: true,
    },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

chatSchema.index({ participants: 1, lastMessageAt: -1 });

chatSchema.pre('save', function updateLastMessage(next) {
  if (this.messages.length) {
    const last = this.messages[this.messages.length - 1];
    this.lastMessageAt = last.sentAt || new Date();
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
