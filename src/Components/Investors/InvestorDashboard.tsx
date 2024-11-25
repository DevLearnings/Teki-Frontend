import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { TekiContext } from "../../App";
import { Link, useParams } from "react-router-dom";

interface PastInvestment {
  name: string;
  amount: string;
  date: string;
  description: string;
}

interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

interface Pitcher {
  username: string;
  name: string;
  connectionStatus: "pending" | "accepted";
  listingName: string;
  messages: Message[];
}

interface Investor {
  _id: number;
  username: string;
  email: string;
  name: string;
  phoneNumber: string;
  investmentInterests: string;
  pastInvestments: PastInvestment[];
  network: string;
  pitches: Pitcher[];
}

const InvestorDashboard: React.FC = () => {
  const { BASE, loading, setLoading, investor } = useContext(TekiContext);
  const [investorRelated, setInvestorRelated] = useState<Investor | null>(null);
  const [newInvestment, setNewInvestment] = useState<PastInvestment>({
    name: "",
    amount: "",
    date: "",
    description: "",
  });
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(
    {}
  );
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);
  const [profileEdit, setProfileEdit] = useState<boolean>(false);
  const [searchPitchers, setSearchPitchers] = useState<string>("");
  const [filterPitchers, setFilterPitchers] = useState<
    "all" | "accepted" | "pending"
  >("all");
  const [addInvestment, setAddInvestment] = useState<boolean>(false);

  const { investorId } = useParams<{ investorId: string }>();

  // Dummy data for initial design
  const dummyInvestorRelated: Investor = {
    _id: 1,
    username: "john_doe",
    email: "john.doe@example.com",
    name: "John Doe",
    phoneNumber: "123-456-7890",
    investmentInterests: "Tech startups, real estate",
    pastInvestments: [
      {
        name: "Company A",
        amount: "10000",
        date: "2022-01-15",
        description: "Tech startup investment",
      },
      {
        name: "Company B",
        amount: "15000",
        date: "2023-04-22",
        description: "Real estate investment",
      },
    ],
    network: "Investor Network XYZ",
    pitches: [
      {
        username: "pitcher_x",
        name: "Pitcher X",
        connectionStatus: "accepted",
        listingName: "Startup X",
        messages: [
          {
            sender: "pitcher_x",
            message: "Hello John!",
            timestamp: "2024-06-28T10:00:00Z",
          },
          {
            sender: "john_doe",
            message: "Hi Pitcher X!",
            timestamp: "2024-06-28T10:02:00Z",
          },
        ],
      },
      {
        username: "pitcher_y",
        name: "Pitcher Y",
        connectionStatus: "pending",
        listingName: "Project Y",
        messages: [
          {
            sender: "pitcher_y",
            message: "Hey John, interested in our latest project?",
            timestamp: "2024-06-28T09:30:00Z",
          },
          {
            sender: "john_doe",
            message: "Sure, tell me more about it.",
            timestamp: "2024-06-28T09:32:00Z",
          },
        ],
      },
    ],
  };

  // Simulate fetching data
  async function fetchInvestorDashboard() {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await Axios.post(`${BASE}/investors/findme/${investorId}`);
      setInvestorRelated(dummyInvestorRelated); // Assuming response structure matches Investor interface
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvestorDashboard();
  }, []);

  const handleAddInvestment = async () => {
    try {
      setLoading(true);
      const updatedInvestments = [
        ...investorRelated!.pastInvestments,
        newInvestment,
      ];
      const updatedInvestor = {
        ...investorRelated!,
        pastInvestments: updatedInvestments,
      };
      setInvestorRelated(updatedInvestor);
      setNewInvestment({
        name: "",
        amount: "",
        date: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithPitcher = (pitcher: string) => {
    const selectedPitcher = investorRelated!.pitches.find(
      (p) => p.username === pitcher
    );
    if (selectedPitcher && selectedPitcher.connectionStatus === "accepted") {
      setActiveChat(pitcher);
      setChatMessages({ [pitcher]: selectedPitcher.messages });
    } else {
      alert(
        "You can only chat with pitchers after they accept your connection request."
      );
    }
  };

  
  const socketURL = "http://localhost:5000"


  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      setLoading(true);
      
      // Send message to backend
      const response = await Axios.post(`${socketURL}/chat/investor-to-pitcher`, {
        senderId: investor!._id, // Assuming investor has an _id field
        receiverId: activeChat, // Assuming activeChat is the pitcher's ID
        messageText: messageInput
      });
  
      if (response.status === 200) {
        // Update local state
        const updatedMessages = [
          ...chatMessages[activeChat!]!,
          {
            sender: investor!.username,
            message: messageInput,
            timestamp: new Date().toISOString(),
          },
        ];
        
        const updatedInvestor = {
          ...investorRelated!,
          pitches: investorRelated!.pitches.map((p) =>
            p.username === activeChat ? { ...p, messages: updatedMessages } : p
          ),
        };
        
        setInvestorRelated(updatedInvestor);
        setChatMessages({ ...chatMessages, [activeChat!]: updatedMessages });
        setMessageInput("");
      } else {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConnection = async (pitcherUsername: string) => {
    try {
      setLoading(true);
      const updatedPitches = investorRelated!.pitches.map((pitch) =>
        pitch.username === pitcherUsername
          ? { ...pitch, connectionStatus: "accepted" }
          : pitch
      );
      const updatedInvestor = {
        ...investorRelated!,
        pitches: updatedPitches,
      };
      setInvestorRelated(updatedInvestor);
      const pitcher = updatedInvestor.pitches.find(
        (p) => p.username === pitcherUsername
      );
      if (pitcher && pitcher.connectionStatus === "accepted") {
        setNotification(`Connection request with ${pitcherUsername} accepted.`);
        setTimeout(() => {
          setNotification("");
        }, 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (pitcherUsername: string) => {
    try {
      setLoading(true);
      const updatedPitches = investorRelated!.pitches.filter(
        (pitch) => pitch.username !== pitcherUsername
      );
      const updatedInvestor = {
        ...investorRelated!,
        pitches: updatedPitches,
      };
      setInvestorRelated(updatedInvestor);
      setNotification(`Connection request to ${pitcherUsername} canceled.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setProfileEdit(!profileEdit);
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // await Axios.put(`${BASE}/investors/${investorId}`, investorRelated);
      setProfileEdit(false);
      setNotification("Profile updated successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPitchers = investorRelated?.pitches.filter((pitcher) => {
    if (filterPitchers === "all") return true;
    return pitcher.connectionStatus === filterPitchers;
  });

  const searchedPitchers = filteredPitchers?.filter((pitcher) =>
    pitcher.name.toLowerCase().includes(searchPitchers.toLowerCase())
  );

  if (!investorRelated || loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/`}>View Homepage!</Link>
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
          Investor Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {investorRelated.name}'s Profile
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username:
              </label>
              <p className="text-gray-800">{investorRelated.username}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email:
              </label>
              <p className="text-gray-800">{investorRelated.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number:
              </label>
              <p className="text-gray-800">{investorRelated.phoneNumber}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Investment Interests:
              </label>
              <p className="text-gray-800">
                {investorRelated.investmentInterests}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Network:
              </label>
              <p className="text-gray-800">{investorRelated.network}</p>
            </div>
            <div className="mt-8">
              <button
                onClick={handleEditProfile}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {profileEdit ? "Cancel" : "Edit Profile"}
              </button>
              {profileEdit && (
                <button
                  onClick={handleProfileSave}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save Profile
                </button>
              )}
            </div>
          </div>
          {/* Right Column */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Past Investments
            </h2>
            <div className="space-y-4">
              {investorRelated.pastInvestments.map((investment, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 mb-4 last:border-b-0"
                >
                  <p className="text-lg font-bold text-gray-800">
                    {investment.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: ${investment.amount}
                  </p>
                  <p className="text-sm text-gray-600">Date: {investment.date}</p>
                  <p className="text-sm text-gray-600">
                    Description: {investment.description}
                  </p>
                </div>
              ))}
              {addInvestment ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border border-gray-300 px-3 py-2 w-full"
                    value={newInvestment.name}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Amount"
                    className="border border-gray-300 px-3 py-2 w-full"
                    value={newInvestment.amount}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        amount: e.target.value,
                      })
                    }
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    className="border border-gray-300 px-3 py-2 w-full"
                    value={newInvestment.date}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        date: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="border border-gray-300 px-3 py-2 w-full"
                    value={newInvestment.description}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        description: e.target.value,
                      })
                    }
                  />
                  <div>
                    <button
                      onClick={handleAddInvestment}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Add Investment
                    </button>
                    <button
                      onClick={() => setAddInvestment(false)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddInvestment(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Add New Investment
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Pitches Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pitches</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search Pitches"
              className="border border-gray-300 px-3 py-2 w-1/3"
              value={searchPitchers}
              onChange={(e) => setSearchPitchers(e.target.value)}
            />
            <select
              className="ml-4 border border-gray-300 px-3 py-2"
              value={filterPitchers}
              onChange={(e) => setFilterPitchers(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {searchedPitchers?.map((pitcher, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 mb-4 border-l-4 border-blue-500"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {pitcher.name} ({pitcher.connectionStatus})
              </h3>
              <p className="text-gray-600 mb-2">{pitcher.listingName}</p>
              <button
                onClick={() => handleChatWithPitcher(pitcher.username)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
              >
                Chat
              </button>
              {pitcher.connectionStatus === "pending" && (
                <button
                  onClick={() => handleAcceptConnection(pitcher.username)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Accept
                </button>
              )}
              {pitcher.connectionStatus === "pending" && (
                <button
                  onClick={() => handleCancelRequest(pitcher.username)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
        {/* Chat Section */}
        {activeChat && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Chat with {activeChat}
            </h2>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="space-y-4">
                {chatMessages[activeChat]?.map((message, index) => (
                  <div
                    key={index}
                    className={`${
                      message.sender === investor!.username
                        ? "bg-blue-100 text-right"
                        : "bg-gray-100"
                    } rounded-lg p-2`}
                  >
                    <p className="text-sm text-gray-800">{message.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="border border-gray-300 px-3 py-2 w-full"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Notification Section */}
        {notification && (
          <div className="mt-8">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{notification}</span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setNotification(null)}
              >
                <svg
                  className="fill-current h-6 w-6 text-green-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path
                    fillRule="evenodd"
                    d="M14.354 5.354a1 1 0 011.414 1.414L11.414 10l4.354 4.354a1 1 0 01-1.414 1.414L10 11.414l-4.354 4.354a1 1 0 01-1.414-1.414L8.586 10 4.232 5.646a1 1 0 011.414-1.414L10 8.586l4.354-4.354z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;
