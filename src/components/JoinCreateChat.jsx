import React, { useState } from "react";
import { motion } from "framer-motion";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../service/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("All fields are required!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      const loadingToast = toast.loading("Joining room... please wait (service may take a few seconds)");
      try {
        const room = await joinChatApi(detail.roomId);
        toast.dismiss(loadingToast);
        toast.success("Joined the room!");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.dismiss(loadingToast);
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error joining room. Please try again.");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      const loadingToast = toast.loading("Creating room... please wait (service may take a few seconds)");
      try {
        const response = await createRoomApi(detail.roomId);
        toast.dismiss(loadingToast);
        toast.success("Room created!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.dismiss(loadingToast);
        if (error.status === 400) {
          toast.error("Room already exists!");
        } else {
          toast.error("Error creating room. Please try again.");
        }
      }
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-2xl bg-white/10 border border-gray-700 shadow-2xl backdrop-blur-xl p-8 flex flex-col gap-6 mt-8"
        >
          <div className="text-center">
            <motion.img
              src={chatIcon}
              alt="Chat Icon"
              className="w-20 h-20 mx-auto mb-2"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 12 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <h1 className="text-2xl text-white font-bold tracking-wide">
              Join or Create a Chat Room
            </h1>
            <p className="text-gray-300 text-sm">Connect with friends instantly!</p>
          </div>

          <div>
            <label htmlFor="userName" className="text-gray-300 block font-medium text-sm mb-1">
              👤 Your Name
            </label>
            <input
              name="userName"
              value={detail.userName}
              onChange={handleFormInputChange}
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="roomId" className="text-gray-300 block font-medium text-sm mb-1">
              🏷️ Room ID
            </label>
            <input
              name="roomId"
              value={detail.roomId}
              onChange={handleFormInputChange}
              type="text"
              placeholder="Enter room ID or create one"
              className="w-full px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={joinChat}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2 rounded-full font-medium transition duration-300 shadow-md"
            >
              Join Room
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createRoom}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-5 py-2 rounded-full font-medium transition duration-300 shadow-md"
            >
              Create Room
            </motion.button>
          </div>
        </motion.div>

        <div className="w-full bg-slate-900 pt-12 pb-20 px-4">
          <h2 className="text-3xl sm:text-4xl text-center font-bold text-white mb-10">
            Features that Make Chat Easy & Powerful
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Real-Time Messaging",
                desc: "Experience instant communication with zero delay. Messages are delivered in real-time using WebSocket technology.",
              },
              {
                title: "Private & Secure",
                desc: "Chat confidently knowing your conversations are protected with end-to-end encryption and secure room access.",
              },
              {
                title: "Create & Join Rooms",
                desc: "Easily create your own chat rooms or join existing ones with just a Room ID. No sign-up required.",
              },
              {
                title: "Fast & Lightweight",
                desc: "Built with performance in mind, our chat app is optimized for speed and low resource usage, even on slow networks.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-slate-800 text-white rounded-xl shadow-xl p-6 border border-slate-700"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default JoinCreateChat;
