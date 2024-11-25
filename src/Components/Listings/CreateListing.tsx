import React, { useContext, useState, ChangeEvent, FormEvent } from "react";
import Axios from "axios";
import {
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Grid,
  TextField,
  TextareaAutosize,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Box,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { TekiContext } from "../../App";


interface FormData {
  title: string;
  shortIdea: string;
  extendedIdea: string;
  baseVideo: File | null;
  baseImage: File | null;
  extendedVideo: File | null;
  extendedImage: File | null;
  link: string;
  category: string;
  teamMembers: string;
  targetMarket: string;
  revenueModel: string;
  visibility: "public" | "private" | "investors-only";
}

const CreateListing = () => {
  const { loading, setLoading, BASE, pitcher } = useContext(TekiContext);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    shortIdea: "",
    extendedIdea: "",
    baseVideo: null,
    baseImage: null,
    extendedVideo: null,
    extendedImage: null,
    link: "",
    category: "",
    teamMembers: "",
    targetMarket: "",
    revenueModel: "",
    visibility: "public", // Default visibility setting
  });
  const [suggestedFriends, setSuggestedFriends] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const addContent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const response = await Axios.post(
        `${BASE}/listings/create`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 201) {
        setSuccessMessage("Idea Submitted Successfully");
        setFormData({
          title: "",
          shortIdea: "",
          extendedIdea: "",
          baseVideo: null,
          baseImage: null,
          extendedVideo: null,
          extendedImage: null,
          link: "",
          category: "",
          teamMembers: "",
          targetMarket: "",
          revenueModel: "",
          visibility: "public", // Reset visibility to default
        });

        // Fetch suggested friends
        // const { data } = await Axios.post(`${BASE}/bots/friends`, {
        //   search: formData.title, // Use title as the search term
        //   username: pitcher.username, // Pass actual username from context
        // });
        // setSuggestedFriends(data.suggestedFriends);
      }
    } catch (err) {
      console.error(err);
      setError("Error: Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown; files?: FileList }>) => {
    const { name, value, files } = e.target;

    if (files) {
      // Handle file inputs
      setFormData({ ...formData, [name as string]: files[0] });
    } else {
      // Handle regular inputs
      setFormData({ ...formData, [name as string]: value as string });
    }
  };

  const handleSnackbarClose = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <Container maxWidth="lg" className="bg-blue-900 text-white py-12 rounded-lg">
      <Box py={8}>
        <Typography variant="h3" align="center" className="text-white font-bold mb-8">
          Submit Your Startup Idea
        </Typography>
        <form onSubmit={addContent} className="mx-auto space-y-8">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box p={3} className="bg-blue-800 text-white rounded-lg">
                <Typography variant="h5" gutterBottom>
                  Basic Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Enter basic details of your idea...
                </Typography>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  variant="outlined"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  margin="normal"
                  className="bg-gray-200 rounded-md"
                />
                <TextareaAutosize
                  name="shortIdea"
                  rowsMin={4}
                  placeholder="Enter a brief description of your idea"
                  value={formData.shortIdea}
                  onChange={handleChange}
                  className="w-full bg-gray-200 rounded-md p-2 mt-4 resize-y"
                />
                <input
                  name="baseVideo"
                  type="file"
                  onChange={handleChange}
                  accept="video/*"
                  className="w-full bg-gray-200 rounded-md p-2 mt-4"
                />
                <input
                  name="baseImage"
                  type="file"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full bg-gray-200 rounded-md p-2 mt-4"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box p={3} className="bg-blue-800 text-white rounded-lg">
                <Typography variant="h5" gutterBottom>
                  Extended Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Provide more details about your idea...
                </Typography>
                <TextareaAutosize
                  name="extendedIdea"
                  rowsMin={6}
                  placeholder="Enter a detailed description of your idea"
                  value={formData.extendedIdea}
                  onChange={handleChange}
                  className="w-full bg-gray-200 rounded-md p-2 mt-4 resize-y"
                />
                <input
                  name="extendedVideo"
                  type="file"
                  onChange={handleChange}
                  accept="video/*"
                  className="w-full bg-gray-200 rounded-md p-2 mt-4"
                />
                <input
                  name="extendedImage"
                  type="file"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full bg-gray-200 rounded-md p-2 mt-4"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box p={3} className="bg-blue-800 text-white rounded-lg">
                <Typography variant="h5" gutterBottom>
                  Media and Links
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Upload media files and provide additional links...
                </Typography>
                <TextField
                  fullWidth
                  name="link"
                  label="Link"
                  variant="outlined"
                  value={formData.link}
                  onChange={handleChange}
                  margin="normal"
                  className="bg-gray-200 rounded-md"
                />
                <FormControl fullWidth variant="outlined" margin="normal" className="bg-gray-200 rounded-md">
                  <InputLabel htmlFor="category">Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    inputProps={{
                      name: "category",
                      id: "category",
                    }}
                  >
                    <MenuItem value="">
                      <em>Choose category</em>
                    </MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" margin="normal" className="bg-gray-200 rounded-md">
                  <InputLabel htmlFor="visibility">Visibility</InputLabel>
                  <Select
                    value={formData.visibility}
                    onChange={handleChange}
                    label="Visibility"
                    inputProps={{
                      name: "visibility",
                      id: "visibility",
                    }}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="investors-only">Investors Only</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box p={3} className="bg-blue-800 text-white rounded-lg">
                <Typography variant="h5" gutterBottom>
                  Team and Market
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Provide information about your team and target market...
                </Typography>
                <TextField
                  fullWidth
                  name="teamMembers"
                  label="Team Members"
                  variant="outlined"
                  value={formData.teamMembers}
                  onChange={handleChange}
                  margin="normal"
                  className="bg-gray-200 rounded-md"
                />
                <TextField
                  fullWidth
                  name="targetMarket"
                  label="Target Market"
                  variant="outlined"
                  value={formData.targetMarket}
                  onChange={handleChange}
                  margin="normal"
                  className="bg-gray-200 rounded-md"
                />
                <TextField
                  fullWidth
                  name="revenueModel"
                  label="Revenue Model"
                  variant="outlined"
                  value={formData.revenueModel}
                  onChange={handleChange}
                  margin="normal"
                  className="bg-gray-200 rounded-md"
                />
              </Box>
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" disabled={loading} className="mt-8">
            {loading ? <CircularProgress size={24} /> : "Submit Idea"}
          </Button>
        </form>
        {suggestedFriends && (
          <Box mt={5}>
            <Typography variant="h6" gutterBottom className="text-white font-bold mb-2">
              Suggested Friends:
            </Typography>
            <Typography variant="body1" className="text-white">{suggestedFriends}</Typography>
          </Box>
        )}
        <Snackbar
          open={!!error || !!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={error ? "error" : "success"}
          >
            {error || successMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CreateListing;
