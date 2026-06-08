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



export const getRequestsForOwner = async (req, res) => {
  try {
    const ownerId = req.params.userId;

    if (!ownerId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Find all requests where user is the owner (books they own)
    const total = await Request.countDocuments({ owner: ownerId });
    const requests = await Request.find({ owner: ownerId })
      .populate('book', 'title images')
      .populate('requester', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out requests with missing populated data
    const safeRequests = requests.filter(r => r.requester && r.book);
    const filteredTotal = safeRequests.length;

    res.json({
      requests: safeRequests,
      total: filteredTotal,
      page,
      pages: Math.ceil(filteredTotal / limit) || 1
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Separate controller for outgoing requests (user as requester)
export const getRequestsByRequester = async (req, res) => {
  try {
    const requesterId = req.params.userId;

    if (!requesterId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Find all requests where user is the requester
    const total = await Request.countDocuments({ requester: requesterId });
    const requests = await Request.find({ requester: requesterId })
      .populate('book', 'title images')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out requests with missing populated data
    const safeRequests = requests.filter(r => r.owner && r.book);

    res.json({
      requests: safeRequests,
      total: safeRequests.length,
      page,
      pages: Math.ceil(safeRequests.length / limit) || 1
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
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
            { $eq: id },
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
                { $eq: updatedRequest.book._id },
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

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

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
      // Skip requests where owner or requester data is missing (user deleted)
      if (!request.owner || !request.requester || !request.book) {
        return;
      }

      const ownerId = request.owner._id ? request.owner._id.toString() : null;
      const requesterId = request.requester._id ? request.requester._id.toString() : null;

      if (!ownerId || !requesterId) {
        return;
      }

      const isOwner = ownerId === userId;
      const otherParticipant = isOwner ? request.requester : request.owner;
      const participantId = isOwner ? requesterId : ownerId;

      if (!conversationsMap.has(participantId)) {
        conversationsMap.set(participantId, {
          id: participantId,
          participant: otherParticipant,
          lastMessage: request.message || (request.book.title ? `Book Request: "${request.book.title}"` : 'Book Request'),
          lastMessageTime: request.createdAt,
          status: request.status,
          book: request.book,
          requestId: request._id,
          isOwner: isOwner,
          unreadCount: 0
        });
      } else {
        const existing = conversationsMap.get(participantId);
        if (request.createdAt > existing.lastMessageTime) {
          existing.lastMessage = request.message || (request.book.title ? `Book Request: "${request.book.title}"` : 'Book Request');
          existing.lastMessageTime = request.createdAt;
          existing.status = request.status;
          existing.book = request.book;
          existing.requestId = request._id;
        }
      }
    });
    const allConversations = Array.from(conversationsMap.values());
    const total = allConversations.length;
    const paginatedConversations = allConversations.slice(skip, skip + limit);

    res.json({
      conversations: paginatedConversations,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
};