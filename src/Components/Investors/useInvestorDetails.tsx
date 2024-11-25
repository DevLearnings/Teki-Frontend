/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import Axios from "axios";
import { TekiContext } from "../../App";


interface Investor {
  // Define the structure of your investor object
  _id: string;
  name: string;
  email: string;
  // Add more properties as needed
}

interface UseInvestorDetailsProps {
  BASE: string;
  investorId: string | undefined;
}

const useInvestorDetails = ({ BASE, investorId }: UseInvestorDetailsProps) => {
  const { investor, setInvestor, loading, setLoading, status, setStatus } = useContext(TekiContext);

  const fetchInvestorDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios.get<Investor>(`${BASE}/investors/findme/${investorId}`);
      if (response.status === 200) {
        setInvestor(response.data);
        setStatus("Investor details fetched successfully.");
      } else {
        setStatus("Failed to fetch investor details");
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred while fetching investor details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (investorId) {
      fetchInvestorDetails();
    }
  }, [BASE, investorId]); // Ensure useEffect dependencies are properly listed

  return { investor, loading, status, fetchInvestorDetails };
};

export default useInvestorDetails;
