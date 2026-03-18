import { authApi } from "../../api/authApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../../utils/storage";

const authDefaults = () => {
  const stored = getStoredAuth();
  return {
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    isAuthenticated: Boolean(stored.accessToken),
  };
};

export const createAuthSlice = (set, get) => ({
  ...authDefaults(),
  authLoading: false,
  authError: null,
  authReady: false,

  clearAuthError: () => set({ authError: null }),

  syncAccessToken: (accessToken) => {
    const current = getStoredAuth();
    setStoredAuth({
      accessToken,
      refreshToken: current.refreshToken,
    });

    set({
      accessToken: accessToken ?? null,
      refreshToken: current.refreshToken ?? null,
      isAuthenticated: Boolean(accessToken),
    });
  },

  setTokens: ({ accessToken, refreshToken }) => {
    setStoredAuth({ accessToken, refreshToken });
    set({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken),
    });
  },

  clearAuthSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      authError: null,
      authLoading: false,
    }),

  initializeAuth: async () => {
    const { accessToken } = getStoredAuth();
    if (!accessToken) {
      get().clearAuthSession();
      set({ authReady: true });
      return false;
    }

    set({ authLoading: true, authError: null });
    get().syncAccessToken(accessToken);

    try {
      await get().loadCurrentUser();
      set({ isAuthenticated: true, authReady: true });
      return true;
    } catch (error) {
      clearStoredAuth();
      get().clearAuthSession();
      get().clearCurrentUser();
      set({
        authError: getApiErrorMessage(error, "Session expired. Please login again."),
        authReady: true,
      });
      return false;
    } finally {
      set({ authLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ authLoading: true, authError: null });

    try {
      const data = await authApi.login({ email, password });
      get().setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      if (data.user) {
        get().setCurrentUser(data.user);
      }

      await get().loadCurrentUser();
      set({ isAuthenticated: true });

      return { success: true, user: get().currentUser };
    } catch (error) {
      const message = getApiErrorMessage(error, "Login failed.");
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ authLoading: false });
    }
  },

  signup: async (payload) => {
    set({ authLoading: true, authError: null });

    try {
      const data = await authApi.register(payload);
      return { success: true, data };
    } catch (error) {
      const message = getApiErrorMessage(error, "Signup failed.");
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ authLoading: false });
    }
  },

  logout: () => {
    clearStoredAuth();
    get().clearCurrentUser();
    get().clearNotifications?.();
    get().clearAuthSession();
  },
});
