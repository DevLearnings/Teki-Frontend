import { useContext, useState, ChangeEvent, FormEvent } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TekiContext } from "../../App";

interface Credentials {
  username: string;
  password: string;
}

const PitcherLogin = () => {
  const { loading, setLoading, status, setStatus, BASE, setThePitcher } =
    useContext(TekiContext);
  const [creds, setCreds] = useState<Credentials>({
    username: "",
    password: "",
  });
  const navigator = useNavigate();

  async function userLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setStatus("");
      setLoading(true);

      const response = await Axios.post(`${BASE}/pitchers/login`, creds);
      if (response.status === 200) {
        const { token, user } = response.data;

        // Store JWT in local storage
        localStorage.setItem("token", token);

        // Set user context
        setThePitcher(user);

        // Send email to user after successful login
        await sendEmail(user.email);

        setTimeout(() => {
          navigator("/");
        }, 1200);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setStatus("Wrong Credentials");
      } else {
        setStatus("Error");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  // Function to send email after successful login
  const sendEmail = async (email: string) => {
    try {
      await Axios.post(`${BASE}/pitchers/send-otp`, { email });
      console.log("Email sent to:", email);
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle error if needed
    }
  };

  return (
    <section className="flex items-center justify-center h-screen md:w-full lg:w-auto lg:p-24">
      <div className="container">
        <div className="flex flex-col justify-center items-center h-full border border-border p-10 rounded-xl">
          <div className="w-full">
            <h1 className="text-5xl text-white text-start font-bold mb-3">
              Login
            </h1>
            <h1 className="text-lg text-muted">
              Please enter your details to Login
            </h1>
          </div>
          <div className="w-full">
            <form onSubmit={userLogin} className="flex flex-col gap-3 mt-5">
              <input
                onChange={handleChange}
                name="username"
                placeholder="Enter username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                onChange={handleChange}
                name="password"
                type="password"
                placeholder="Enter password..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit" disabled={loading} className="w-full mt-5">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="mt-4 text-start">
              <h1 className="text-gray-600">{status}</h1>
              <Link to="/pitchereg" className="text-blue-500 hover:underline">
                Not registered?
              </Link>
              <Link to={"/forgotpass/pitcher"}>Forgot Password?</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PitcherLogin;
