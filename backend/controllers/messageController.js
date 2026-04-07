const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const chatUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: chatUserId },
        { sender: chatUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
