import express from 'express';
const router = express.Router();
// import { createRequest } from "../controllers/requestController";
import { createRequest, getRequestsForUser, updateRequestStatus, getConversationsForUser } from "../controllers/requestController.js"

// POST /api/requests
router.post("/", createRequest);
router.get("/owner/:userId", getRequestsForUser);
router.get("/user/:userId", getRequestsForUser);
router.get("/conversations/:userId", getConversationsForUser);
router.patch("/:id", updateRequestStatus);

export default router;
