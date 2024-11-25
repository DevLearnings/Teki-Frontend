/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
import { TekiContext } from "../../App";
import useInvestorDetails from "./useInvestorDetails";

interface Investor {
  _id: string;
  username: string;
  name: string;
  email: string;
  company: string;
  joinedDate: string;
  // Add more properties as needed
}

const override = css`
  display: block;
  margin: 0 auto;
  border-color: #3b82f6; // Adjust color if needed
`;

const InvestorProfile: React.FC = () => {
  const {
    investor: initialInvestor,
    reputationScore,
    BASE,
    setLoading,
  } = useContext(TekiContext);
  const { investor, loading, status, fetchInvestorDetails } =
    useInvestorDetails({ BASE, investorId: initialInvestor?._id });
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchInvestorDetails();
    } catch (error) {
      setError(error?.message || "Failed to fetch investor details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ margin: "40px" }}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <h1>Loading...</h1>
            {/* <div type="Oval" color="#3B82F6" height={80} width={80} timeout={0} /> */}
          </div>
        ) : investor && investor._id ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Investor Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Investor Details</h2>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Username:</span>{" "}
                  {investor.username}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Name:</span> {investor.name}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Email:</span> {investor.email}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Company:</span>{" "}
                  {investor.company}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Joined Date:</span>{" "}
                  {new Date(investor.joinedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                {reputationScore && (
                  <div className="bg-blue-100 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      Reputation Score
                    </h2>
                    <p className="text-blue-800 text-lg font-bold">
                      {reputationScore}
                    </p>
                  </div>
                )}
                {/* Additional sections can be added here */}
              </div>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
              onClick={handleRefresh}
            >
              Refresh Data
            </button>
          </>
        ) : (
          <div className="text-red-600">
            <h1 className="text-2xl font-bold mb-4">
              Failed to fetch investor details.
            </h1>
            <p>{error || status}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

InvestorProfile.propTypes = {
  BASE: PropTypes.string.isRequired,
};

export default InvestorProfile;
