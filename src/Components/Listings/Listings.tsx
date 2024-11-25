import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { CircularProgress, Snackbar, Button } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Link, useParams } from "react-router-dom";
import { TekiContext } from "../../App";

interface Pitcher {
  _id: string;
  title: string;
  shortIdea: string;
  visibility: string;
}

const Listings: React.FC = () => {
  const { pitchId } = useParams<{ pitchId: string }>();
  const { loading, setLoading, BASE, thePitcher,investor } = useContext(TekiContext);
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [BASE, pitchId, setLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`${BASE}/listings/${pitchId}`);
      setPitchers(response.data.pitchers);
    } catch (err) {
      console.error(err);
      setError("Error fetching pitchers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await Axios.delete(`${BASE}/listings/${id}`);
      setPitchers((prevPitchers) =>
        prevPitchers.filter((pitcher) => pitcher._id !== id)
      );
      setSuccessMessage("Pitcher deleted successfully");
    } catch (err) {
      console.error(err);
      setError("Error deleting pitcher. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVisibility = async (id: string, visibility: string) => {
    try {
      setLoading(true);
      await Axios.put(`${BASE}/listings/${id}`, { visibility });
      setSuccessMessage("Pitcher visibility updated successfully");
    } catch (err) {
      console.error(err);
      setError("Error updating pitcher visibility. Please try again later.");
    } finally {
      fetchData();
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccessMessage("");
  };

  const Alert: React.FC<AlertProps> = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  const handleConnect = async (pitcherId: string) => {
    try {
      setLoading(true);
      const response = await Axios.post(`${BASE}/listings/connect-with-pitcher`, {
        pitcherId,
      });
      if (response.status === 200) {
        setSuccessMessage("Connection request sent!");
      } else {
        setError("Error connecting with the pitcher. Please try again later.");
      }
    } catch (error) {
      console.error("Error connecting with the pitcher:", error);
      setError("Error connecting with the pitcher. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ margin: "40px" }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {pitchers.length > 0 ? (
              pitchers.map((pitcher) => (
                <div key={pitcher._id}>
                  <h2>{pitcher.title}</h2>
                  <p>{pitcher.shortIdea}</p>
                  <Button component={Link} to={`/pitcher/${pitcher._id}`}>
                    View Details
                  </Button>
                  {investor._id && <Button onClick={()=>{
                    handleConnect(investor._id)
                  }}>Connect</Button>}
                  {thePitcher?._id === pitcher._id && (
                    <div>
                      <Button onClick={() => handleDelete(pitcher._id)}>
                        Delete
                      </Button>
                      {pitcher?.visibility !== "public" && (
                        <Button
                          onClick={() =>
                            handleUpdateVisibility(pitcher._id, "public")
                          }
                        >
                          Make Public
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No pitchers found.</p>
            )}
          </>
        )}
      </div>

      <Snackbar
        open={error !== "" || successMessage !== ""}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        {error ? (
          <Alert onClose={handleCloseSnackbar} severity="error">
            {error}
          </Alert>
        ) : (
          <Alert onClose={handleCloseSnackbar} severity="success">
            {successMessage}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default Listings;
