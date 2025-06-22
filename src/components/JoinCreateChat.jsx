import React, { useState } from "react";
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
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined the room!");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error joining room");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room created!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("Room already exists!");
        } else {
          toast.error("Error creating room");
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-gray-900 bg-opacity-60 border border-gray-700 shadow-2xl backdrop-blur p-8 flex flex-col gap-6">
        <div className="text-center">
          <img src={chatIcon} className="w-20 h-20 mx-auto mb-2" alt="Chat Icon" />
          <h1 className="text-2xl text-gray-400 font-bold tracking-wide">Join or Create a Chat Room</h1>
          <p className="text-gray-400 text-sm">Connect with friends instantly!</p>
        </div>

        <div>
          <label htmlFor="userName" className="text-gray-400 block font-medium text-sm mb-1">
            Your Name
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
          <label htmlFor="roomId" className=" text-gray-400 block font-medium text-sm mb-1">
            Room ID
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

        <div className="flex gap-4 mt-4 justify-center">
          <button
            onClick={joinChat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition duration-200 shadow"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition duration-200 shadow"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
