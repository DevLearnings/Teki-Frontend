import { useContext } from "react";
import { Link } from "react-router-dom";
import { TekiContext } from "../../App";

const steps = [
  {
    path: "/",
    name: "Home",
    description: "Start here to learn about our application and its features.",
  },
  {
    path: "/listing/:listingId",
    name: "Listings",
    description: "Explore and manage listings.",
  },
  {
    path: "/pitcher/:pitcherId",
    name: "Pitcher Profile",
    description: "View and edit your pitcher profile.",
  },
  {
    path: "/investor/:investorId",
    name: "Investor Profile",
    description: "View and edit your investor profile.",
  },
  {
    path: "/donate",
    name: "Donate",
    description: "Support campaigns by making donations.",
  },
  {
    path: "/create",
    name: "Create Pitches",
    description: "Create new pitches and projects.",
  },
  {
    path: "/work/:userId",
    name: "Workspace",
    description: "Access and manage your workspace.",
  },
];

const Expect = [
  {
    title: "Pre-Marketing Site",
    description:
      "Includes Donation, Listings, Profiles (Pitcher/Investor), and Workspace features.",
  },
  {
    title: "Donation System",
    description:
      "Non-registered users can donate to campaigns using Stripe. Pitchers and investors can create donation campaigns linked to their profiles and listings.",
  },
  {
    title: "Listings",
    description:
      "Pitchers can add listings and change their visibility. Investors can view public listings.",
  },
  {
    title: "Profiles",
    description:
      "Separate profiles for Pitchers and Investors, linked to their listings and donation campaigns.",
  },
  {
    title: "Dashboard",
    description:
      "Overview for both Pitchers and Investors, including their activities and connections.",
  },
  {
    title: "Pitcher Workspace",
    description:
      "Manage multiple startups under different profiles within one workspace. Includes supply management and task management features.",
  },
  {
    title: "Investor Features",
    description:
      "Find pitches, connect with pitchers through listings, and chat with connected pitchers.",
  },
  {
    title: "Supply Management",
    description:
      "Manage digital, physical, and influencer assets. Request supplies and track their status.",
  },
  {
    title: "Task Management",
    description:
      "Kanban boards and sticky notes for internal startup tasks. Mark tasks as completed with images and descriptions, sharable with investors.",
  },
  {
    title: "Social Media Integration",
    description:
      "Link and schedule posts for social media accounts associated with startups.",
  },
  {
    title: "Chat System",
    description:
      "Allow communication between connected pitchers and investors.",
  },
  {
    title: "Admin Panel",
    description: "Manage overall system, users, and resolve issues.",
  },
  {
    title: "Bug Fixes and UI Improvements",
    description:
      "Address issues in Workspace, Donate backend, Login UI, and Listings overflow. Improve overall user interface.",
  },
  {
    title: "Future Features",
    description:
      "Integration with accounting data (QuickBooks) and CRM functionality for startups.",
  },
];

const GetStarted = () => {
  // const {thePitcher,investor} = useContext(TekiContext)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome to Teki!
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Follow these steps to get started:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.path}
            className="p-4 bg-white shadow-md rounded-lg transition duration-300 ease-in-out"
          >
            <h2 className="text-2xl font-semibold mb-2">{step.name}</h2>
            <p className="text-gray-500 mb-4">{step.description}</p>
            <Link
              to={step.path}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Go to {step.name}
            </Link>
          </div>
        ))}
      </div>
      <div className="expectations" style={{ margin: "40px" }}>
        <h1 style={{ margin: "40px" }}>What to Expect</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Expect.map((step, index) => (
            <div
              key={index}
              style={{margin:"40px",padding:"40px"}}
              className="p-4 bg-white shadow-md rounded-lg transition duration-300 ease-in-out"
            >
              <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
              <p className="text-gray-500 mb-4">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
