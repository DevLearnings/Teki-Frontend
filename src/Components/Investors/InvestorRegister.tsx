import { useContext, useState, ChangeEvent, FormEvent } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TekiContext } from "../../App";

interface InvestorVerification {
  username: string;
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  investmentInterests: string;
  pastInvestments: string;
}

const InvestorRegister = () => {
  const { loading, setLoading, BASE, setStatus } = useContext(TekiContext);
  const navigate = useNavigate();

  const [investorVer, setInvestorVer] = useState<InvestorVerification>({
    username: "",
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    investmentInterests: "",
    pastInvestments: "",
  });

  const registerInvestor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await Axios.post(`${BASE}/investors/register`, investorVer);

      if (response.status === 201) {
        setStatus("Your application is being reviewed, please wait!");
        setTimeout(() => {
          setStatus("");
          navigate("/");
        }, 2000);
      } else if (response.status === 404) {
        setStatus("Item not found");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setStatus("Error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvestorVer((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register as an Investor</h1>
        <form onSubmit={registerInvestor}>
          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={investorVer.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={investorVer.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={investorVer.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={investorVer.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              Phone Number:
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={investorVer.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Investment Interests */}
          <div className="mb-4">
            <label htmlFor="investmentInterests" className="block text-sm font-medium mb-1">
              Investment Interests:
            </label>
            <input
              type="text"
              id="investmentInterests"
              name="investmentInterests"
              value={investorVer.investmentInterests}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Past Investments */}
          <div className="mb-4">
            <label htmlFor="pastInvestments" className="block text-sm font-medium mb-1">
              Past Investments:
            </label>
            <input
              type="text"
              id="pastInvestments"
              name="pastInvestments"
              value={investorVer.pastInvestments}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md focus:outline-none"
          >
            {loading ? "Registering..." : "Register as Investor"}
          </button>
        </form>
        <div className="mt-4 text-start">
          <h1 className="text-gray-600">{setStatus}</h1>
          <Link to="/investorlog" className="text-blue-500 hover:underline">
            Already Registered?
          </Link>
        </div>

        {/* Status message */}
        <div className="text-center mt-4">
          <p>{setStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorRegister;