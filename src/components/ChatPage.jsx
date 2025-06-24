import React, { useEffect, useRef, useState } from "react";
import { MdSend, MdPerson, MdLogout } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../service/RoomService";
import { timeAgo } from "../config/helper";
import { motion } from "framer-motion";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, roomId, currentUser]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        setMessages(messages);
      } catch (error) {
        toast.error("Failed to load messages");
      }
    }
    if (connected) loadMessages();
  }, [connected, roomId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat");
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };
    if (connected) connectWebSocket();
  }, [connected, roomId]);

  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  const handleLogout = () => {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-slate-900 via-gray-900 to-slate-800 text-white">
      <header className="fixed top-0 left-0 w-full bg-gray-800 bg-opacity-80 backdrop-blur border-b border-gray-700 z-10 py-4 px-6 flex justify-between items-center shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <p className="text-white font-medium text-base sm:text-lg">Room: <span className="font-bold">{roomId}</span></p>
          <p className="text-white font-medium text-base sm:text-lg">User: <span className="font-bold">{currentUser}</span></p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm rounded-full flex items-center gap-2"
        >
          <MdLogout /> Leave Room
        </motion.button>
      </header>

      <main
        ref={chatBoxRef}
        className="pt-24 pb-32 px-4 sm:px-6 flex-1 w-full max-w-5xl mx-auto overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 animate-pulse">
            No messages yet. Start the conversation 💬
          </div>
        ) : (
          messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            const isSelf = message.sender === currentUser;
            return (
              <motion.div
                key={index}
                ref={isLast ? lastMessageRef : null}
                className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-4`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <div
                  className={`p-4 rounded-2xl max-w-xs sm:max-w-sm shadow-lg border text-white flex flex-col gap-1 ${
                    isSelf ? "bg-gradient-to-br from-green-500 to-emerald-700" : "bg-gradient-to-br from-blue-500 to-indigo-700"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MdPerson className="text-lg" /> {message.sender}
                  </div>
                  <div className="text-sm break-words">{message.content}</div>
                  <div className="text-xs text-gray-200">{timeAgo(message.timeStamp)}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 bg-opacity-90 backdrop-blur rounded-full flex items-center justify-between px-4 py-2 gap-3 shadow-2xl border border-slate-700"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Type your message..."
            className="bg-slate-700 text-white rounded-full flex-1 px-4 py-2 text-sm focus:outline-none placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full text-white"
          >
            <MdSend size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
