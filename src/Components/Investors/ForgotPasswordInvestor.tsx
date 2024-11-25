import { useState, useContext } from "react";
import { TekiContext } from "../../App";

const ForgotPasswordInvestor: React.FC = () => {
  const { BASE, setLoading } = useContext(TekiContext);
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE}/investors/forgot/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Forgot Password for Investors</h2>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPasswordInvestor;
