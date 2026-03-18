import { notificationApi } from "../../api/notificationApi";
import { getApiErrorMessage } from "../../utils/apiError";

const dedupeById = (notifications) => {
  const seen = new Set();
  return notifications.filter((item) => {
    const id = String(item?._id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const createNotificationSlice = (set) => ({
  notifications: [],
  unreadNotifications: 0,
  notificationsLoading: false,
  notificationError: null,

  fetchNotifications: async (params = {}) => {
    set({ notificationsLoading: true, notificationError: null });
    try {
      const data = await notificationApi.getAll(params);
      set({
        notifications: data?.notifications || [],
        unreadNotifications: data?.unreadCount || 0,
      });
      return data;
    } catch (error) {
      set({
        notificationError: getApiErrorMessage(
          error,
          "Unable to load notifications.",
        ),
      });
      return null;
    } finally {
      set({ notificationsLoading: false });
    }
  },

  prependNotification: (notification) =>
    set((state) => {
      const nextNotifications = dedupeById([notification, ...state.notifications]);
      const unreadNotifications = nextNotifications.filter(
        (item) => !item.is_read,
      ).length;

      return {
        notifications: nextNotifications,
        unreadNotifications,
      };
    }),

  markNotificationRead: async (id) => {
    try {
      const updated = await notificationApi.markRead(id);
      set((state) => {
        const notifications = state.notifications.map((item) =>
          item._id === id ? updated : item,
        );
        return {
          notifications,
          unreadNotifications: notifications.filter((item) => !item.is_read).length,
        };
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to mark notification as read."),
      };
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await notificationApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((item) => ({
          ...item,
          is_read: true,
        })),
        unreadNotifications: 0,
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to mark notifications as read."),
      };
    }
  },

  clearNotifications: () =>
    set({
      notifications: [],
      unreadNotifications: 0,
      notificationsLoading: false,
      notificationError: null,
    }),
});
