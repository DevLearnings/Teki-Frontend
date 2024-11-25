import React from "react";
import { Avatar } from "@mui/material";

// Import your image as a variable (or directly in src attribute)

export interface Conversation {
  _id: string;
  message: string;
  createdAt: Date;
  sender: string;
  type: "pitcher" | "investor";
}

interface ChatMenuProps {
  message: string;
  time: string;
  sender: string;
  type: "pitcher" | "investor";
}

const ChatMenu: React.FC<ChatMenuProps> = ({
  message,
  time,
  sender,
  type,
}) => {
  return (
    <div className="flex items-start space-x-4">
      <Avatar className="bg-blue-500" alt={sender} />
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{sender}</h3>
          {type === "pitcher" && (
            <img src={"https://cdn.pixabay.com/photo/2017/06/10/07/21/chat-2389223_640.png"} alt="Chat Icon" className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <p className="text-gray-600">{message}</p>
        <p className="text-gray-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
};

export default ChatMenu;
