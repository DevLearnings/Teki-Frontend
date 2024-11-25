import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useContext,
} from "react";
import axios from "axios";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ToastContainer, toast } from "react-toastify";
import { Button, Modal } from "@mui/material";
import io, { Socket } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { TekiContext } from "../../App";
import { Link } from "react-router-dom";

// import TestAvisha from "./test";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  amountRaised: number;
  milestones: string[];
  updates: string[];
  dateCreated: string;
  image: string;
  comments: string[];
}

interface Notification {
  message: string;
}

const CardSection: React.FC = () => {
  return (
    <div>
      <label
        htmlFor="card-element"
        className="block text-sm font-medium text-gray-700"
      >
        Credit or debit card
      </label>
      <CardElement
        id="card-element"
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};

const DonateForm: React.FC<{
  selectedCampaign: Campaign;
  onClose: () => void;
  onSuccess: (updatedCampaign: Campaign) => void;
}> = ({ selectedCampaign, onClose, onSuccess }) => {
  const [donorName, setDonorName] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [donating, setDonating] = useState<boolean>(false);
  const [donationError, setDonationError] = useState<string>("");

  // const {BASE} = useContext(TekiContext)

  const BASE = "http://localhost:3000"; // Make sure this matches your server's port

  const stripe = useStripe();
  const elements = useElements();

  const handleDonate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    if (!donorName || !donationAmount) {
      setDonationError("Please provide donor name and donation amount");
      return;
    }

    setDonating(true);
    setDonationError("");

    try {
      const response = await axios.post(`${BASE}/donations/payments`, {
        // amount: parseFloat(donationAmount) * 100,
        amount: parseFloat(donationAmount),
        description: `Donation for campaign: ${selectedCampaign._id}`,
        campaignId: selectedCampaign._id,
      });

      const { clientSecret } = response.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: donorName,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Payment succeeded, update the server
      await axios.post(`${BASE}/payment-success`, {
        paymentIntentId: result.paymentIntent.id,
      });

      const updatedCampaign = {
        ...selectedCampaign,
        amountRaised:
          selectedCampaign.amountRaised + parseFloat(donationAmount),
      };

      await axios.put(
        `${BASE}/donations/${selectedCampaign._id}`,
        updatedCampaign
      );

      onSuccess(updatedCampaign);
      toast("Donation successful!");
      onClose();
    } catch (error) {
      // catch (error: any) {
      //   setDonationError(
      //     error.message || "Failed to process donation. Please try again later."
      //   );
      //   console.error("Error donating:", error);
      // }

      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      setDonationError(
        error.response
          ? error.response.data.error
          : "Failed to process donation. Please try again later."
      );
    } finally {
      setDonating(false);
    }
  };

  return (
    <form onSubmit={handleDonate} className="space-y-4">
      <div>
        <label
          htmlFor="donorName"
          className="block text-sm font-medium text-gray-700"
        >
          Your Name
        </label>
        <input
          type="text"
          id="donorName"
          name="donorName"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="donationAmount"
          className="block text-sm font-medium text-gray-700"
        >
          Donation Amount ($)
        </label>
        <input
          type="number"
          id="donationAmount"
          name="donationAmount"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
          min="1"
          step="0.01"
        />
      </div>
      <CardSection />
      {donationError && <p className="text-red-500 text-sm">{donationError}</p>}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={donating}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {donating ? "Processing..." : "Donate"}
        </button>
      </div>
    </form>
  );
};

const Donate: React.FC = () => {
  const [endDate, setEndDate] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [updates, setUpdates] = useState<string[]>([]);
  const [creatingCampaign, setCreatingCampaign] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      _id: "1",
      title: "Clean Water for All",
      description: "Help us provide clean water to communities in need.",
      targetAmount: 10000,
      amountRaised: 4500,
      milestones: ["Reached $1,000", "Reached $2,500", "Reached $4,000"],
      updates: [
        "We have started drilling the first well.",
        "We have reached 50% of our target!",
      ],
      dateCreated: "2024-01-10",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Great initiative!", "Happy to support this cause."],
    },
    {
      _id: "2",
      title: "School Supplies for Kids",
      description:
        "Providing essential school supplies to underprivileged children.",
      targetAmount: 5000,
      amountRaised: 2500,
      milestones: ["Reached $500", "Reached $1,500", "Reached $2,000"],
      updates: [
        "We have distributed the first batch of supplies.",
        "We are halfway to our goal!",
      ],
      dateCreated: "2024-02-15",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Education is so important.", "Keep up the good work!"],
    },
    {
      _id: "3",
      title: "Tree Planting Initiative",
      description: "Planting trees to combat climate change and deforestation.",
      targetAmount: 8000,
      amountRaised: 6400,
      milestones: ["Reached $2,000", "Reached $4,000", "Reached $6,000"],
      updates: [
        "We have planted 500 trees.",
        "We are close to reaching our goal!",
      ],
      dateCreated: "2024-03-20",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["This is a fantastic project!", "I love trees!"],
    },
    {
      _id: "4",
      title: "Medical Aid for Remote Villages",
      description:
        "Providing essential medical aid and healthcare services to remote villages.",
      targetAmount: 12000,
      amountRaised: 7000,
      milestones: ["Reached $3,000", "Reached $5,000", "Reached $7,000"],
      updates: [
        "First batch of medical supplies delivered.",
        "We have reached over 50% of our target!",
      ],
      dateCreated: "2024-04-10",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Health is wealth!", "Glad to see this initiative."],
    },
    {
      _id: "5",
      title: "Solar Power for Schools",
      description:
        "Installing solar panels to provide sustainable energy to schools.",
      targetAmount: 15000,
      amountRaised: 9000,
      milestones: ["Reached $5,000", "Reached $7,500", "Reached $9,000"],
      updates: [
        "First set of solar panels installed.",
        "We are 60% towards our goal!",
      ],
      dateCreated: "2024-05-05",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Renewable energy is the future!", "Great project!"],
    },
    {
      _id: "6",
      title: "Food for Homeless",
      description:
        "Providing meals and essential supplies to the homeless population.",
      targetAmount: 7000,
      amountRaised: 4200,
      milestones: ["Reached $1,500", "Reached $3,000", "Reached $4,000"],
      updates: [
        "First batch of meals distributed.",
        "We have reached 60% of our target!",
      ],
      dateCreated: "2024-06-01",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Happy to help!", "Wonderful cause!"],
    },
    {
      _id: "7",
      title: "Clean Oceans Initiative",
      description:
        "Organizing beach clean-ups and raising awareness about ocean pollution.",
      targetAmount: 10000,
      amountRaised: 5500,
      milestones: ["Reached $2,000", "Reached $4,000", "Reached $5,500"],
      updates: [
        "First beach clean-up event successful.",
        "We are more than halfway to our goal!",
      ],
      dateCreated: "2024-06-15",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Protect our oceans!", "Great work, everyone!"],
    },
    {
      _id: "8",
      title: "Literacy Programs for Adults",
      description:
        "Providing literacy programs to help adults improve their reading and writing skills.",
      targetAmount: 6000,
      amountRaised: 3300,
      milestones: ["Reached $1,000", "Reached $2,000", "Reached $3,000"],
      updates: [
        "First literacy workshop conducted.",
        "We are over 50% towards our target!",
      ],
      dateCreated: "2024-07-01",
      image:
        "https://cdn.pixabay.com/photo/2020/05/29/22/00/field-5236879_1280.jpg",
      comments: ["Education for all!", "Amazing initiative!"],
    },
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [comments, setComments] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("amountRaised");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [donateMenuVisible, setDonateMenuVisible] = useState<boolean>(false);

  const { thePitcher, BASE, investor } = useContext(TekiContext);


  const socketURL = "http://localhost:5000";

  useEffect(() => {

    const newSocket = io(socketURL);
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
    }, 6000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${BASE}/donations`);
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to fetch campaigns. Please try again later.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingCampaign(true);
    setError("");

    try {
      if (!title || !description || !targetAmount) {
        throw new Error("All fields are required");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("targetAmount", targetAmount);
      formData.append("dateCreated", new Date().toISOString().split("T")[0]);

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(`${BASE}/donations`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const createdCampaign = response.data;

      setNotification({ message: "Campaign created successfully!" });
      setCampaigns([...campaigns, createdCampaign]);

      setTitle("");
      setDescription("");
      setTargetAmount("");
      setMilestones([]);
      setUpdates([]);
      setImage(null);
      setDonateMenuVisible(false);
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
      console.error("Error creating campaign:", err);
    } finally {
      setCreatingCampaign(false);
      toast(notification?.message || "");
    }
  };

  const filterAndSortCampaigns = (campaigns: Campaign[]): Campaign[] => {
    if (!Array.isArray(campaigns)) {
      return [];
    }

    return campaigns
      .filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === "amountRaised" || sortOption === "targetAmount") {
          return b[sortOption] - a[sortOption];
        } else if (sortOption === "dateCreated") {
          return (
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
          );
        }
        return 0;
      });
  };

  const getComments = async (campaignId: string) => {
    //once clicked should get comments
    try {
      const response = await axios.get(
        `${BASE}/donations/${campaignId}/comments`
      );
      const updatedCampaign = response.data;
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign._id === campaignId ? updatedCampaign : campaign
        )
      );
      if (selectedCampaign && selectedCampaign._id === campaignId) {
        setSelectedCampaign(updatedCampaign);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to fetch comments. Please try again.");
    }
  };

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
    getComments(campaign?._id);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleAddComment = async (campaignId: string, comment: string) => {
    try {
      const response = await axios.post(
        `${BASE}/donations/${campaignId}/comments`,
        { comment }
      );
      const updatedCampaign = response.data;
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign._id === campaignId ? updatedCampaign : campaign
        )
      );
      if (selectedCampaign && selectedCampaign._id === campaignId) {
        setSelectedCampaign(updatedCampaign);
      }
      setComments("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleCommentSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCampaign && comments.trim()) {
      handleAddComment(selectedCampaign._id, comments);
    }
  };

  const calculateCompletionPercentage = (campaign: Campaign): number => {
    if (campaign.amountRaised === 0 || campaign.targetAmount === 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.floor((campaign.amountRaised / campaign.targetAmount) * 100)
    );
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage < 25) {
      return "bg-red-500";
    } else if (percentage < 50) {
      return "bg-orange-500";
    } else if (percentage < 75) {
      return "bg-yellow-500";
    } else {
      return "bg-green-500";
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* <TestAvisha/> */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f2f0] px-10 py-3">
          <div className="flex items-center gap-4 text-[#181411]">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
              Teki
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link
                to="/"
                className="text-[#181411] text-sm font-medium leading-normal"
              >
                Home
              </Link>
              <Link
                to="/donate"
                className="text-[#181411] text-sm font-medium leading-normal"
              >
                Campaigns
              </Link>
              <Link
                to="/explore"
                className="text-[#181411] text-sm font-medium leading-normal"
              >
                Explore
              </Link>
              {thePitcher?._id ||
                (investor?._id && (
                  <Link
                    to="/create"
                    className="text-[#181411] text-sm font-medium leading-normal"
                  >
                    Create
                  </Link>
                ))}
              <button
                onClick={() => setDonateMenuVisible(!donateMenuVisible)}
                className="text-[#181411] text-sm font-medium leading-normal"
              >
                {investor?._id ||
                  (thePitcher?._id && !donateMenuVisible ? "Create Campaign" : "Close Campaign")}
              </button>
              <button
                onClick={() => setDonateMenuVisible(!donateMenuVisible)}
                className="text-[#181411] text-sm font-medium leading-normal"
              >
               {!donateMenuVisible ? " Create Campaign" : "Close Campaign"}
              </button>
            </div>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {donateMenuVisible && (
              <div className="mb-8 p-4 bg-gray-100 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">Create a Campaign</h3>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="targetAmount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Target Amount
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Campaign Image
                    </label>
                    <input
                      type="file"
                      id="image"
                      onChange={handleFileChange}
                      className="mt-1 block w-full"
                      accept="image/*"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingCampaign}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {creatingCampaign ? "Creating..." : "Create Campaign"}
                  </button>
                </form>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#181411] text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Support a campaign
              </p>
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#897361] flex border-none bg-[#f4f2f0] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search for campaigns"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181411] focus:outline-0 focus:ring-0 border-none bg-[#f4f2f0] focus:border-none h-full placeholder:text-[#897361] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="pb-3">
              <div className="flex border-b border-[#e6e0db] px-4">
                <div className="flex flex-col items-center justify-center border-b-[3px] border-b-[#181411] text-[#181411] pb-[13px] pt-4">
                  <p className="text-[#181411] text-sm font-bold leading-normal tracking-[0.015em]">
                    All Campaigns
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3" style={{ margin: "40px" }}>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="amountRaised">Sort by Amount Raised</option>
                <option value="targetAmount">Sort by Target Amount</option>
                <option value="dateCreated">Sort by Date Created</option>
              </select>
            </div>

            {filterAndSortCampaigns(campaigns).length ? (
              filterAndSortCampaigns(campaigns).map((campaign) => (
                <div
                  key={campaign._id}
                  className="p-4 @container"
                  style={{ margin: "40px" }}
                >
                  <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                      style={{ backgroundImage: `url(${campaign.image})` }}
                    ></div>
                    <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                      <p className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">
                        {campaign.title}
                      </p>
                      <div className="flex items-end gap-3 justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-[#897361] text-base font-normal leading-normal">
                            {campaign.description}
                          </p>
                          <p className="text-[#897361] text-base font-normal leading-normal">
                            ${campaign.amountRaised.toFixed(2)} out of $
                            {campaign.targetAmount.toFixed(2)}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className={`${getProgressBarColor(
                                calculateCompletionPercentage(campaign)
                              )} h-2.5 rounded-full`}
                              style={{
                                width: `${calculateCompletionPercentage(
                                  campaign
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCampaignClick(campaign)}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#ee7f2b] text-[#181411] text-sm font-medium leading-normal"
                        >
                          <span className="truncate">Donate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <h1>No Results Found</h1>
            )}
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 max-w-md w-full rounded-lg shadow-lg">
          {selectedCampaign && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {selectedCampaign.title}
              </h3>
              <p className="mb-4">{selectedCampaign.description}</p>
              <p className="mb-4">
                Target: ${selectedCampaign.targetAmount.toFixed(2)}
              </p>
              <p className="mb-4">
                Raised: ${selectedCampaign.amountRaised.toFixed(2)}
              </p>
              <Elements stripe={stripePromise}>
                <DonateForm
                  selectedCampaign={selectedCampaign}
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={(updatedCampaign) => {
                    setCampaigns(
                      campaigns.map((c) =>
                        c._id === updatedCampaign._id ? updatedCampaign : c
                      )
                    );
                    setSelectedCampaign(updatedCampaign);
                  }}
                />
              </Elements>
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Comments</h4>
                {selectedCampaign.comments.map((comment, index) => (
                  <p key={index} className="mb-2">
                    {comment}
                  </p>
                ))}
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Add a comment..."
                  />
                  <button
                    type="submit"
                    className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Comment
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Donate;
