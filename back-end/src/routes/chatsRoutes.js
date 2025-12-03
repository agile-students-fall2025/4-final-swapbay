import express from 'express';
import { body, validationResult } from 'express-validator';
import { Chat, User } from '../models/index.js';
import { authRequired } from '../middleware/auth.js';
import { toChatMessage, toId } from '../utils/serializers.js';

const router = express.Router();

router.use(authRequired);

async function getOrCreateChat(userIdA, userIdB) {
  const sorted = [toId(userIdA), toId(userIdB)].sort();
  let chat = await Chat.findOne({ participants: sorted });
  if (!chat) {
    chat = await Chat.create({ participants: sorted, messages: [] });
  }
  return chat;
}

function unreadCountFor(messages = [], viewerId) {
  const idString = viewerId?.toString?.();
  if (!idString) return 0;
  return messages.reduce((count, msg) => {
    const isRead =
      Array.isArray(msg.readBy) && msg.readBy.some((id) => id?.toString?.() === idString);
    return count + (isRead ? 0 : 1);
  }, 0);
}

router.get('/', async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id }).sort({ lastMessageAt: -1 }).lean();
  const otherIds = chats
    .map((chat) => chat.participants.find((p) => p.toString() !== req.user._id.toString()))
    .filter(Boolean);

  const users = await User.find({ _id: { $in: otherIds } }, 'username name photo').lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const summaries = chats
    .map((chat) => {
      const otherId = chat.participants.find((p) => p.toString() !== req.user._id.toString());
      const otherUser = userMap.get(otherId?.toString());
      const last = chat.messages[chat.messages.length - 1];
      const unreadCount = unreadCountFor(chat.messages, req.user._id);
      const lastSender = last
        ? last?.sender?.toString?.() === req.user._id.toString()
          ? 'me'
          : 'them'
        : null;

      return {
        username: otherUser?.username || '',
        name: otherUser?.name || '',
        photo: otherUser?.photo || '',
        lastMessage: last?.text || null,
        lastTimestamp: last?.sentAt || null,
        lastSender,
        unreadCount,
        totalMessages: chat.messages.length,
      };
    })
    .filter((chat) => chat.username);

  const unreadTotal = summaries.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  res.json({ chats: summaries, unreadTotal });
});

router.get('/:username', async (req, res) => {
  const contact = await User.findOne({ username: req.params.username });
  if (!contact) return res.status(404).json({ message: 'User not found' });

  const chat = await getOrCreateChat(req.user._id, contact._id);

  let updated = false;
  chat.messages = chat.messages || [];
  chat.messages.forEach((msg) => {
    const hasRead =
      Array.isArray(msg.readBy) &&
      msg.readBy.some((id) => id?.toString?.() === req.user._id.toString());
    if (!hasRead) {
      msg.readBy = [...(msg.readBy || []), req.user._id];
      updated = true;
    }
  });

  if (updated) {
    await chat.save();
  }

  res.json({
    chat: {
      id: toId(chat._id),
      username: contact.username,
      name: contact.name,
      photo: contact.photo || '',
      messages: chat.messages.map((m) => toChatMessage(m, req.user._id.toString())),
      unreadCount: 0,
    },
  });
});

router.post('/:username/messages', [body('text').trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Message text is required.' });
  }
  const contact = await User.findOne({ username: req.params.username });
  if (!contact) return res.status(404).json({ message: 'User not found' });

  const chat = await getOrCreateChat(req.user._id, contact._id);
  const timestamp = new Date();
  const message = {
    sender: req.user._id,
    text: req.body.text.trim(),
    sentAt: timestamp,
    readBy: [req.user._id],
  };
  chat.messages.push(message);
  chat.lastMessageAt = timestamp;
  await chat.save();

  res.status(201).json({
    chat: {
      id: toId(chat._id),
      username: contact.username,
      name: contact.name,
      photo: contact.photo || '',
      messages: chat.messages.map((m) => toChatMessage(m, req.user._id.toString())),
      unreadCount: unreadCountFor(chat.messages, req.user._id),
    },
    message: toChatMessage(message, req.user._id.toString()),
  });
});

export default router;
