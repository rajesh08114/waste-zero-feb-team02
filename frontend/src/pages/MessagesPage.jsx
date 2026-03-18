import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { messageApi } from "../api/messageApi";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MessagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await messageApi.getConversations();
        setConversations(data?.conversations || []);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message || "Unable to load conversations.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/60">
        <h1 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
          Messages
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70 dark:text-emerald-100/70">
          Continue chats with your matched NGO or volunteers.
        </p>
      </section>

      {loading ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Loading...</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/25 dark:text-emerald-300">
          <p>No conversations yet.</p>
          <Link
            to="/matches"
            className="mt-2 inline-flex rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Open Matches
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.conversation_id}
              to={`/chat/${conversation?.other_user?._id}`}
              className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-950/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    {conversation?.other_user?.name || "Unknown user"}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    {conversation?.latest_message?.content}
                  </p>
                </div>
                <span className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                  {formatTime(conversation?.latest_message?.timestamp)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
