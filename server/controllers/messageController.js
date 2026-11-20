import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for the logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'fullName email role profilePic')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName profilePic role')
      .populate('receiver', 'fullName profilePic role')
      .sort({ createdAt: 1 });

    // Mark unread messages sent to this user as read
    await Message.updateMany(
      { conversationId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start or get existing conversation with another user
export const startConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate('participants', 'fullName email role profilePic');

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessageText: '',
      });
      await conversation.save();
      await conversation.populate('participants', 'fullName email role profilePic');
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a new message (HTTP fallback alongside Socket.io)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, receiverId, text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Message content or image required' });
    }

    let targetConvId = conversationId;

    if (!targetConvId && receiverId) {
      let conv = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
      if (!conv) {
        conv = new Conversation({
          participants: [senderId, receiverId],
        });
        await conv.save();
      }
      targetConvId = conv._id;
    }

    const conv = await Conversation.findById(targetConvId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const actualReceiverId =
      receiverId ||
      conv.participants.find(p => p.toString() !== senderId.toString());

    const newMessage = new Message({
      conversationId: targetConvId,
      sender: senderId,
      receiver: actualReceiverId,
      text: text || '',
      image: image || '',
    });

    await newMessage.save();

    conv.lastMessage = newMessage._id;
    conv.lastMessageText = text || (image ? '📷 Image' : '');
    conv.lastMessageTime = new Date();
    await conv.save();

    await newMessage.populate('sender', 'fullName profilePic role');
    await newMessage.populate('receiver', 'fullName profilePic role');

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
