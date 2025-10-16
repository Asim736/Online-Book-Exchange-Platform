import Request from "../models/Request.js"

export const createRequest = async (req, res) => {
  const { bookId, requesterId, ownerId, message } = req.body;

  try {
    // Avoid duplicate requests
    const existing = await Request.findOne({ book: bookId, requester: requesterId });
    if (existing) {
      return res.status(400).json({ error: "You already requested this book." });
    }

    const request = await Request.create({
      book: bookId,
      requester: requesterId,
      owner: ownerId,
      message,
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    console.error("Request creation failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};



export const getRequestsForUser = async (req, res) => {
  try {
    const ownerId = req.params.userId; // we get the userId from the URL param

    if (!ownerId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find all requests where ownerId matches
    const requests = await Request.find({ owner: ownerId }).populate("book").populate("requester");

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};



export const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updatedRequest = await Request.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('book requester owner');

        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // If request is accepted, update book status to exchanged
        if (status === 'accepted' && updatedRequest.book) {
            const Book = (await import('../models/Book.js')).default;
            await Book.findByIdAndUpdate(
                updatedRequest.book._id,
                { status: 'exchanged' },
                { new: true }
            );
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: 'Failed to update request status' });
    }
};

export const getConversationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find all requests where user is either owner or requester
    const requests = await Request.find({
      $or: [
        { owner: userId },
        { requester: userId }
      ]
    })
    .populate('book', 'title images')
    .populate('requester', 'username email')
    .populate('owner', 'username email')
    .sort({ createdAt: -1 });

    // Group conversations by the other participant
    const conversationsMap = new Map();

    requests.forEach(request => {
      const isOwner = request.owner._id.toString() === userId;
      const otherParticipant = isOwner ? request.requester : request.owner;
      const participantId = otherParticipant._id.toString();

      if (!conversationsMap.has(participantId)) {
        conversationsMap.set(participantId, {
          id: participantId,
          participant: otherParticipant,
          lastMessage: request.message || `Book Request: "${request.book.title}"`,
          lastMessageTime: request.createdAt,
          status: request.status,
          book: request.book,
          requestId: request._id,
          isOwner: isOwner,
          unreadCount: 0 // We'll implement this later
        });
      } else {
        // Update if this request is more recent
        const existing = conversationsMap.get(participantId);
        if (request.createdAt > existing.lastMessageTime) {
          existing.lastMessage = request.message || `Book Request: "${request.book.title}"`;
          existing.lastMessageTime = request.createdAt;
          existing.status = request.status;
          existing.book = request.book;
          existing.requestId = request._id;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
    
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
};