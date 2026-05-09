const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get message history with a user
// @route   GET /api/messages/:userId
// @access  Private
const getMessageHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of conversations (for Admin/Shop)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find unique users that current user has exchanged messages with
    const sentMessages = await Message.find({ sender: currentUserId }).distinct('receiver');
    const receivedMessages = await Message.find({ receiver: currentUserId }).distinct('sender');

    const userIds = [...new Set([...sentMessages, ...receivedMessages])];

    const users = await User.find({ _id: { $in: userIds } }, 'username avatar shopName role');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessageHistory,
  getConversations
};
