import { useEffect } from "react";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "../../services/socketClient";
import { useAppStore } from "../../store/useAppStore";

const RealtimeBridge = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const accessToken = useAppStore((state) => state.accessToken);
  const currentUser = useAppStore((state) => state.currentUser);
  const fetchNotifications = useAppStore((state) => state.fetchNotifications);
  const prependNotification = useAppStore((state) => state.prependNotification);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !currentUserId) {
      disconnectSocket();
      return undefined;
    }

    fetchNotifications({ limit: 20 });
    const socket = connectSocket(accessToken);
    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      prependNotification(notification);

      if (notification?.type === "newMatch") {
        toast.success(notification.message || "You have a new match.");
      }
    };

    const handleNewMessage = (message) => {
      const isOwnMessage = String(message?.sender_id) === String(currentUserId);
      const activePath = window.location.pathname;
      const inCurrentChat = activePath === `/chat/${message?.sender_id}`;

      if (!isOwnMessage && !inCurrentChat) {
        const senderName = message?.sender_name || "New";
        toast(`${senderName}: ${message?.content || "New message"}`);
      }
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    accessToken,
    currentUserId,
    fetchNotifications,
    isAuthenticated,
    prependNotification,
  ]);

  return null;
};

export default RealtimeBridge;
