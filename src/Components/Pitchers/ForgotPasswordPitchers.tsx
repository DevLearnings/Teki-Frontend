import { useState, useContext } from "react";
import { TekiContext } from "../../App";

const ForgotPasswordPitchers: React.FC = () => {
  const { BASE, setLoading } = useContext(TekiContext);
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE}/pitchers/forgot/${username}`, {
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
      <h2>Forgot Password for Pitchers</h2>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPasswordPitchers;
