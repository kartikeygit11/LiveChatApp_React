import React, { useEffect, useRef, useState } from "react";
import {  MdSend, MdPerson } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../service/RoomService";
import { timeAgo } from "../config/helper";

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

  // Scroll to last message
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="fixed top-0 left-0 w-full bg-gray-800 border-b border-gray-700 z-10 py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold">Room: {roomId}</h1>
        <h1 className="text-lg font-bold">User: {currentUser}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 transition-all px-4 py-2 rounded-full text-sm font-medium"
        >
          Leave Room
        </button>
      </header>

      <main
        ref={chatBoxRef}
        className="pt-20 pb-28 px-6 flex-1 w-full max-w-4xl mx-auto overflow-y-auto border border-gray-600 rounded-md"
      >
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div
              key={index}
              ref={isLast ? lastMessageRef : null}
              className={`flex ${
                message.sender === currentUser
                  ? "justify-end"
                  : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start gap-3 p-3 max-w-xs rounded-xl shadow-md ${
                  message.sender === currentUser
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MdPerson className="text-xl" />
                    <p className="text-sm font-semibold">{message.sender}</p>
                  </div>
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs text-gray-300">
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-6">
        <div className="bg-gray-800 rounded-full flex items-center justify-between px-4 py-2 gap-3 shadow-lg border border-gray-700">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Type your message..."
            className="bg-gray-700 text-white rounded-full flex-1 px-4 py-2 focus:outline-none"
          />
         
          <button
            onClick={sendMessage}
            className="bg-green-600 hover:bg-green-700 transition p-2 rounded-full"
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
