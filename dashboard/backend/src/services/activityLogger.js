import ActivityLog from "../models/ActivityLog.js";
import { triggerPusher } from "../config/pusher.js";

/**
 * Log activity asynchronously without blocking main response execution.
 * Accepts either a User document/object or a User ObjectId.
 */
export const logActivity = (userOrId, action, details) => {
  // Fire and forget / non-blocking execution so main HTTP requests respond instantly (<200ms)
  setImmediate(async () => {
    try {
      const isUserObj = userOrId && typeof userOrId === "object" && userOrId._id;
      const userId = isUserObj ? userOrId._id : userOrId;

      if (!userId) return;

      const log = await ActivityLog.create({
        user: userId,
        action,
        details,
      });

      let populatedLog;
      if (isUserObj && userOrId.name) {
        populatedLog = {
          ...log.toObject(),
          user: {
            _id: userOrId._id,
            name: userOrId.name,
            email: userOrId.email,
            role: userOrId.role,
          },
        };
      } else {
        populatedLog = await ActivityLog.findById(log._id).populate("user", "name email role").lean();
      }

      if (populatedLog) {
        triggerPusher("new_activity", populatedLog);
      }
    } catch (error) {
      console.error("Failed to log activity:", error.message);
    }
  });
};
