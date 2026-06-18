import ActivityLog from "../models/ActivityLog.js";
import { triggerPusher } from "../config/pusher.js";

export const logActivity = async (userId, action, details) => {
  try {
    const log = await ActivityLog.create({
      user: userId,
      action,
      details,
    });
    const populatedLog = await ActivityLog.findById(log._id).populate("user", "name email role").lean();
    triggerPusher("new_activity", populatedLog);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
