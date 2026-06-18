import Pusher from "pusher";
import dotenv from "dotenv";

dotenv.config();

let pusher = null;
if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
  console.log("Pusher instance initialized successfully.");
} else {
  console.warn("Pusher environment variables missing. Real-time sync will be disabled.");
}

export const triggerPusher = (event, data) => {
  if (pusher) {
    pusher.trigger("ktm-decor-dashboard", event, data)
      .catch((err) => {
        console.error(`Pusher trigger error for event "${event}":`, err);
      });
  }
};

export default pusher;
