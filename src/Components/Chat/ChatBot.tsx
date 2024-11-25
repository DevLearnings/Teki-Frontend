import { useContext, useState, useRef, useEffect } from "react";
import Axios from "axios";
import { TekiContext } from "../../App";

interface Message {
  text: string;
  type: "user" | "bot";
  timestamp: Date;
}

interface ChatBoxProps {}

const ChatBot: React.FC<ChatBoxProps> = () => {
  const { toggleBot, setToggleBot, status, setStatus, BASE } = useContext(TekiContext);

  const [userAsks, setUserAsks] = useState<{ search: string; username: string }>({
    search: "",
    username: "",
  });
  const [loading,setLoading] = useState<boolean>(false); //local state cuz it messes things up!
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [typing, setTyping] = useState<boolean>(false); // State for typing indicator
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    // Load conversation history from localStorage on component mount
    const savedConversation = JSON.parse(localStorage.getItem("conversation") || "[]");
    if (savedConversation.length > 0) {
      setConversation(savedConversation);
    }
  }, []);

  useEffect(() => {
    // Save conversation history to localStorage whenever it changes
    localStorage.setItem("conversation", JSON.stringify(conversation));
  }, [conversation]);

  const addMessageToConversation = (message: Message) => {
    setConversation((prevConversation) => [...prevConversation, message]);
  };

  const sendMessage = async () => {
    try {
      setLoading(true);
      setTyping(false); // Reset typing indicator
      const response = await Axios.post<string>(`${BASE}/bots`, { search: userAsks.search, username: userAsks.username });
      if (response.status === 200) {
        const userMessage: Message = { text: userAsks.search, type: "user", timestamp: new Date() };
        const botMessage: Message = { text: response.data, type: "bot", timestamp: new Date() };

        addMessageToConversation(userMessage);
        addMessageToConversation(botMessage);
        setGeminiResponse(response.data);
      } else if (response.status === 404) {
        setStatus("No results found!");
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const scheduleAppointment = async () => {
    try {
      setLoading(true);
      setTyping(false); // Reset typing indicator
      const response = await Axios.post(`${BASE}/bots/appointments`, {
        username: userAsks.username,
        investorName: "Investor", // Replace with actual investor name
        date: new Date().toISOString().split('T')[0], // Current date for example
        time: new Date().toISOString().split('T')[1].slice(0, 5), // Current time for example
        query: userAsks.search,
      });
      if (response.status === 201) {
        const appointmentMessage: Message = { text: "Appointment scheduled successfully!", type: "bot", timestamp: new Date() };
        addMessageToConversation(appointmentMessage);
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAsks({ ...userAsks, [e.target.name]: e.target.value });
    if (e.target.value.trim() !== "") {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userAsks.search.trim() !== "") {
      e.preventDefault();
      sendMessage();
      setUserAsks({ search: "", username: userAsks.username });
    }
  };

  const clearConversation = () => {
    setConversation([]);
    localStorage.removeItem("conversation");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!toggleBot ? (
        <button
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg focus:outline-none"
          onClick={() => setToggleBot(!toggleBot)}
        >
          <img
            src="https://img.icons8.com/ios/50/FFFFFF/speech-bubble--v2.png"
            alt="Open chat"
            className="w-6 h-6"
          />
        </button>
      ) : (
        <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden" style={{margin:"40px"}}>
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h4 className="text-lg font-semibold">Ask Vexy</h4>
            <button
              onClick={() => setToggleBot(!toggleBot)}
              className="focus:outline-none"
            >
              <svg
                className="w-4 h-4 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 3.293a1 1 0 011.414 0L10 8.586l5.293-5.293a1 1 0 111.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4 h-80 overflow-y-auto" ref={conversationRef} >
            <div className="space-y-2">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.type === "user" ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  <div
                    className={`${
                      message.type === "user"
                        ? "bg-blue-600 text-white self-end"
                        : "bg-gray-100 text-gray-700 self-start"
                    } p-3 rounded-lg inline-block max-w-2/3 break-words`}
                    style={{ opacity: 1 }}
                  >
                    {message.text}
                    <div className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</div>
                  </div>
                </div>
              ))}
              {loading && <div className="text-blue-600 text-right">Loading...</div>}
              {geminiResponse && (
                <div className="bg-gray-100 p-3 rounded-lg text-gray-700 self-start">
                  <p>{geminiResponse}</p>
                  <div className="text-xs text-gray-400">{formatTimestamp(new Date())}</div>
                </div>
              )}
              {status && <div className="text-red-600 text-right">{status}</div>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-2">
              <input
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                name="search"
                placeholder="Type a message..."
                value={userAsks.search}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || userAsks.search.trim() === ""}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none ${loading || userAsks.search.trim() === "" ? "cursor-not-allowed" : ""}`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
              <button
                type="button"
                onClick={scheduleAppointment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
              >
                Schedule
              </button>
              <button
                type="button"
                onClick={clearConversation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Clear
              </button>
            </form>
            {typing && (
              <div className="text-xs text-gray-400 text-right">Typing...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function formatTimestamp(timestamp: Date): string {
  return `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
}

export default ChatBot;
