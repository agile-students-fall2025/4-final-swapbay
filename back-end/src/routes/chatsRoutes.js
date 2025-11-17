import express from 'express';
import { store, getCurrentUser, nextId } from '../data/mockStore.js';
import { getChatsSummary } from '../services/app-service.js';

const router = express.Router();

router.use((req, res, next) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  req.currentUser = user;
  next();
});

function getOrCreateChat(ownerUsername, contactUsername) {
  let chat = store.chats.find(
    (entry) => entry.ownerUsername === ownerUsername && entry.username === contactUsername,
  );
  if (!chat) {
    chat = { id: nextId('chats'), ownerUsername, username: contactUsername, messages: [] };
    store.chats.push(chat);
  }
  return chat;
}

router.get('/', (req, res) => {
  const chats = getChatsSummary(req.currentUser.username);
  res.json({ chats });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  const chat = getOrCreateChat(req.currentUser.username, username);
  res.json({ chat });
});

router.post('/:username/messages', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Message text is required.' });
  }

  const ownerUsername = req.currentUser.username;
  const contactUsername = req.params.username;
  const timestamp = new Date().toISOString();

  const ownerChat = getOrCreateChat(ownerUsername, contactUsername);
  const myMessage = { sender: 'me', text: text.trim(), timestamp };
  ownerChat.messages.push(myMessage);

  const contactChat = getOrCreateChat(contactUsername, ownerUsername);
  const mirroredMessage = { sender: 'them', text: text.trim(), timestamp };
  contactChat.messages.push(mirroredMessage);

  res.status(201).json({ chat: ownerChat, message: myMessage });
});

export default router;
