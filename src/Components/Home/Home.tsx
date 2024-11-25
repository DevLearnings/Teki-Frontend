/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext, ChangeEvent } from "react";
import Axios from "axios";
import { TekiContext } from "../../App";
import { Pitcher, UserContextType } from "./types";
import { Link, useParams } from "react-router-dom";
import { Button, CircularProgress, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const dummyData: Pitcher[] = [
  {
    _id: "1",
    name: "Tech Pitch",
    description:
      "An innovative tech solution that revolutionizes the way we interact with smart devices.",
    category: "tech",
    image: "https://source.unsplash.com/random/800x600?tech",
  },
  {
    _id: "2",
    name: "Finance Pitch",
    description:
      "A groundbreaking finance project that democratizes access to investment opportunities.",
    category: "finance",
    image: "https://source.unsplash.com/random/800x600?finance",
  },
  {
    _id: "3",
    name: "Health Pitch",
    description:
      "A health initiative with global impact, focusing on preventive care and telemedicine.",
    category: "health",
    image: "https://source.unsplash.com/random/800x600?health",
  },
  {
    _id: "4",
    name: "Education Pitch",
    description:
      "Revolutionizing education for all through personalized AI-driven learning experiences.",
    category: "education",
    image: "https://source.unsplash.com/random/800x600?education",
  },
];

const Listings = () => {
  const { pitchId } = useParams();
  const { loading, setLoading, BASE, setStatus, investor, user, thePitcher } =
    useContext(TekiContext) as UserContextType;
  const [data, setData] = useState<Pitcher[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  async function fetchContent() {
    try {
      setLoading(true);
      const response = await Axios.get(`${BASE}/listings`, {
        params: {
          category: selectedType,
        },
      });
      if (response.status === 200) {
        setData(response.data.length !== 0 ? response.data : dummyData);
        setStatus("");
      } else {
        setStatus("Error fetching data, using dummy data.");
        setData(dummyData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatus("Error fetching data, using dummy data.");
      setData(dummyData);
    } finally {
      setLoading(false);
    }
  }

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await Axios.delete(`${BASE}/listings/${id}`);
      setData(data.filter((pitcher) => pitcher._id !== id));
      setSuccessMessage("Pitcher deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Error deleting pitcher. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (pitcherId: string) => {
    try {
      setLoading(true);
      await Axios.post(`${BASE}/listings/connect-with-pitcher`, { pitcherId });
      setSuccessMessage("Connected with the pitcher successfully.");
    } catch (err) {
      console.error(err);
      setError("Error connecting with the pitcher. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <section className="min-h-screen w-full py-16 bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="container mx-auto px-4">
        <Link to={`/investorboard/${investor?._id}`}>My Dashboard</Link>
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800 tracking-tight">
          Welcome to <span className="text-blue-600">Teki</span>
        </h1>
        {investor._id && (
          <div className="mb-12 max-w-md mx-auto">
            {/* Replace <search /> with your actual Search component */}
            <search />
          </div>
        )}

        <div className="mb-12 text-center">
          <label
            htmlFor="type-select"
            className="mr-4 font-semibold text-gray-700"
          >
            Filter by Category:
          </label>
          <select
            id="type-select"
            value={selectedType}
            onChange={handleTypeChange}
            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out bg-white text-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="tech">Tech</option>
            <option value="finance">Finance</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {data && data.length ? (
              data.map((pitcher) => (
                <div
                  key={pitcher._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
                >
                  <Link to={`/listing/${pitcher?._id}`} className="block h-full">
                    <img
                      src={
                        pitcher?.image ||
                        `https://source.unsplash.com/random/800x600?${pitcher?.category}`
                      }
                      alt={pitcher?.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-2 text-gray-800">
                        {pitcher?.name}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {pitcher?.description}
                      </p>
                      <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                        {pitcher?.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 flex justify-between">
                    <button
                      onClick={() => handleDelete(pitcher._id)}
                      className="bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleConnect(pitcher._id)}
                      className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-700">
                No pitches available in this category.
              </p>
            )}
          </div>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity="error"
          >
            {error}
          </MuiAlert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity="success"
          >
            {successMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </section>
  );
};

export default Listings;
