import { useContext, useState, ChangeEvent, FormEvent } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TekiContext } from "../../App";


interface Social {
  platform: string;
  link: string;
}

interface Pitcher {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  idCardFront: File | null;
  idCardBack: File | null;
  utilityBill: File | null;
  socials: Social[];
}

const PitcherRegister = () => {
  const { loading, setLoading, BASE, status, setStatus } = useContext(TekiContext);
  const navigate = useNavigate();

  const [pitcher, setPitcher] = useState<Pitcher>({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    idCardFront: null,
    idCardBack: null,
    utilityBill: null,
    socials: [{ platform: "", link: "" }], // Initialize with one empty social media field
  });

  const [socialCount, setSocialCount] = useState<number>(1); // Counter for number of social platforms

  // Function to handle form submission
  const registerPitcher = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate that at least one social media link is provided
      if (pitcher.socials.length === 0 || pitcher.socials.some(social => !social.platform || !social.link.trim())) {
        setStatus("Please provide at least one valid social media platform and link.");
        setLoading(false);
        return;
      }

      // Prepare form data for backend registration
      const formData = new FormData();
      formData.append("username", pitcher.username);
      formData.append("email", pitcher.email);
      formData.append("password", pitcher.password);
      formData.append("phoneNumber", pitcher.phoneNumber);
      formData.append("idCardFront", pitcher.idCardFront as File);
      formData.append("idCardBack", pitcher.idCardBack as File);
      formData.append("utilityBill", pitcher.utilityBill as File);

      // Append each social platform and link to form data
      pitcher.socials.forEach((social, index) => {
        formData.append(`socials[${index}][platform]`, social.platform);
        formData.append(`socials[${index}][link]`, social.link);
      });

      // Send registration request to backend
      const response = await Axios.post(`${BASE}/pitchers/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        // If registration successful, send email to pitcher
        await sendEmail(pitcher.email);

        setStatus("Registration complete! Redirecting to login...");
        setTimeout(() => {
          setStatus("");
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setStatus("Username or Email already taken!");
      } else {
        setStatus("Error occurred during registration");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to send email to registered pitcher
  const sendEmail = async (email: string) => {
    try {
      await Axios.post(`${BASE}/pitchers/send-otp`, { email });
      console.log("Email sent to:", email);
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle error if needed
    }
  };

  // Function to handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPitcher({
      ...pitcher,
      [e.target.name]: e.target.value,
    });
  };

  // Function to handle file uploads
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setPitcher({
      ...pitcher,
      [name]: files ? files[0] : null,
    });
  };

  // Function to handle changes in social links
  const handleChangeSocial = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const updatedSocials = [...pitcher.socials];
    updatedSocials[index][e.target.name] = e.target.value;
    setPitcher({
      ...pitcher,
      socials: updatedSocials,
    });
  };

  // Function to add a new social platform field
  const addSocialField = () => {
    setSocialCount(socialCount + 1);
    setPitcher({
      ...pitcher,
      socials: [...pitcher.socials, { platform: "", link: "" }],
    });
  };

  // Function to remove a social platform field
  const removeSocialField = (index: number) => {
    const updatedSocials = [...pitcher.socials];
    updatedSocials.splice(index, 1);
    setSocialCount(socialCount - 1);
    setPitcher({
      ...pitcher,
      socials: updatedSocials,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-lg w-full bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Register as a Pitcher</h1>
        <form onSubmit={registerPitcher} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={pitcher.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={pitcher.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={pitcher.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">Phone Number:</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={pitcher.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* ID Card Front */}
          <div>
            <label htmlFor="idCardFront" className="block text-sm font-medium mb-1">ID Card Front:</label>
            <input
              type="file"
              id="idCardFront"
              name="idCardFront"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* ID Card Back */}
          <div>
            <label htmlFor="idCardBack" className="block text-sm font-medium mb-1">ID Card Back:</label>
            <input
              type="file"
              id="idCardBack"
              name="idCardBack"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Utility Bill */}
          <div>
            <label htmlFor="utilityBill" className="block text-sm font-medium mb-1">Utility Bill:</label>
            <input
              type="file"
              id="utilityBill"
              name="utilityBill"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {/* Social media platforms */}
          {pitcher.socials.map((social, index) => (
            <div key={index} className="space-y-4">
              <div>
                <label htmlFor={`platform${index}`} className="block text-sm font-medium mb-1">Social Platform:</label>
                <select
                  id={`platform${index}`}
                  name="platform"
                  value={social.platform}
                  onChange={(e) => handleChangeSocial(index, e)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Platform</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label htmlFor={`link${index}`} className="block text-sm font-medium mb-1">Social Link:</label>
                <input
                  type="text"
                  id={`link${index}`}
                  name="link"
                  value={social.link}
                  onChange={(e) => handleChangeSocial(index, e)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>
              {pitcher.socials.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialField(index)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md focus:outline-none"
                >
                  Remove Social Platform
                </button>
              )}
            </div>
          ))}
          
          {/* Add Social Platform button */}
          {socialCount < 3 && (
            <button
              type="button"
              onClick={addSocialField}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md focus:outline-none"
            >
              Add Social Platform
            </button>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md focus:outline-none"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-start">
              <h1 className="text-gray-600">{status}</h1>
              <Link to="/pitcherlog" className="text-blue-500 hover:underline">
                Already Registered?
              </Link>
            </div>
        {/* Status message */}
        {status && (
          <div className="text-center mt-4 text-red-500">
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PitcherRegister;
