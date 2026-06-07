import express from 'express';
const router = express.Router();
// import { createRequest } from "../controllers/requestController";
import { createRequest, getRequestsForOwner, getRequestsByRequester, updateRequestStatus, getConversationsForUser } from "../controllers/requestController.js"

// POST /api/requests
router.post("/", createRequest);
// Get paginated requests for books owned by a user
// Query params: ?page=1&limit=10
router.get("/owner/:userId", getRequestsForOwner);

// Get paginated requests made by a user (as requester)
router.get("/user/:userId", getRequestsByRequester);

// Get paginated conversations for a user (for inbox)
// Query params: ?page=1&limit=10
router.get("/conversations/:userId", getConversationsForUser);
router.patch("/:id", updateRequestStatus);

export default router;
