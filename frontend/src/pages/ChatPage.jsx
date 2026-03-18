import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { messageApi } from "../api/messageApi";
import { connectSocket, getSocket } from "../services/socketClient";
import { useAppStore } from "../store/useAppStore";

const formatMessageTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const dedupeMessages = (messages) => {
  const seen = new Set();
  return messages.filter((item) => {
    const key = item?._id || `${item?.timestamp}-${item?.sender_id}-${item?.content}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const accessToken = useAppStore((state) => state.accessToken);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await messageApi.getHistory(userId, { limit: 100 });
        setMessages(data?.messages || []);
        setOtherUser(data?.otherUser || null);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Unable to load chat history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  useEffect(() => {
    if (!currentUserId || !accessToken) return undefined;
    const socket = getSocket() || connectSocket(accessToken);
    if (!socket) return undefined;

    const onIncomingMessage = (message) => {
      const isConversationMessage =
        String(message?.sender_id) === String(userId) ||
        String(message?.receiver_id) === String(userId);

      if (!isConversationMessage) return;
      setMessages((prev) => dedupeMessages([...prev, message]));
    };

    socket.on("newMessage", onIncomingMessage);

    return () => {
      socket.off("newMessage", onIncomingMessage);
    };
  }, [accessToken, currentUserId, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(
    () => Boolean(content.trim()) && !sending,
    [content, sending],
  );

  const handleSend = async (event) => {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent || sending) return;

    setSending(true);

    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        const response = await new Promise((resolve) => {
          socket.emit(
            "sendMessage",
            {
              receiver_id: userId,
              content: nextContent,
            },
            resolve,
          );
        });

        if (!response?.ok) {
          throw new Error(response?.message || "Unable to send message");
        }

        setMessages((prev) => dedupeMessages([...prev, response.message]));
      } else {
        const sent = await messageApi.send({
          receiver_id: userId,
          content: nextContent,
        });
        setMessages((prev) => dedupeMessages([...prev, sent]));
      }

      setContent("");
    } catch (sendError) {
      toast.error(sendError?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/40 dark:bg-rose-900/20">
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="mt-4 rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 dark:border-rose-700 dark:text-rose-300"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
          Chat with {otherUser?.name || "User"}
        </h1>
        <p className="mt-1 text-xs text-emerald-700/75 dark:text-emerald-300/75">
          {otherUser?.role} {otherUser?.location ? `- ${otherUser.location}` : ""}
        </p>
      </section>

      <section className="flex h-[64vh] flex-col rounded-3xl border border-emerald-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/65">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => {
            const isSender = String(message.sender_id) === String(currentUserId);
            return (
              <div
                key={message._id || `${message.timestamp}-${message.content}`}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isSender
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/55 dark:text-emerald-100"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isSender ? "text-emerald-100" : "text-emerald-700/70"
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 border-t border-emerald-200 pt-3 dark:border-emerald-900/45">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm text-emerald-900 outline-none focus:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ChatPage;
