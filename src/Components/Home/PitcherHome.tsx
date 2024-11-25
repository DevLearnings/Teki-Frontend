import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Box,
  ChakraProvider,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  IconButton,
  useToast,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon, CloseIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";
import { TekiContext } from "../../App";
import { io } from "socket.io-client";

// Interfaces
interface Pitch {
  _id: string;
  title: string;
  createdAt: Date;
  views: number;
  visibility: "public" | "pitchers" | "private";
}

interface AccessRequest {
  _id: string;
  investorId: string;
  investorName: string;
  listingTitle: string;
  status: string;
  createdAt: Date;
}

interface Conversation {
  _id: string;
  message: string;
  createdAt: Date;
  sender: string;
  type: "pitcher" | "investor";
}

interface TekiContextType {
  BASE: string;
  setLoading: (loading: boolean) => void;
  thePitcher: {
    _id: string;
    username: string;
  };
  loading: boolean;
}

const PitcherHome: React.FC = () => {
  const { BASE, setLoading, thePitcher, loading } = useContext(TekiContext as React.Context<TekiContextType>);
  const [pitcherData, setPitcherData] = useState<Pitch[]>([]);
  const [convoData, setConvoData] = useState<Conversation[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [activeInvestorId, setActiveInvestorId] = useState<string>("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const socketURL = "http://localhost:5000"

  const socket = io(socketURL);

  useEffect(() => {
    socket.on("pitcherToInvestorMessage", ({ senderId, receiverId, messageText }) => {
      const newConversation: Conversation = {
        _id: `${convoData.length + 1}`,
        message: messageText,
        createdAt: new Date(),
        sender: senderId,
        type: "investor",
      };
      setConvoData(prevData => [...prevData, newConversation]);
      setActiveConversations(prevConvos => [...prevConvos, newConversation]);
    });
  
    return () => {
      socket.off("pitcherToInvestorMessage");
    };
  }, [convoData]);

  useEffect(() => {
    const fetchPitcherData = async () => {
      try {
        setLoading(true);
        const pitchesResponse = await axios.get(`${BASE}/listings/${thePitcher._id}`);
        const convoResponse = await axios.get(`${BASE}/pitchers/conversations/${thePitcher._id}`);
        const accessRequestsResponse = await axios.get(`${BASE}/pitchers/connection-requests/${thePitcher._id}`);

        setPitcherData(pitchesResponse.data || []);
        setConvoData(convoResponse.data || []);
        setAccessRequests(accessRequestsResponse.data || []);
        setActiveConversations(
          convoResponse.data?.filter(
            (conversation: Conversation) => conversation.type === "pitcher"
          ) || []
        );
      } catch (error) {
        console.error("Error fetching pitcher data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPitcherData();
  }, [BASE, setLoading, toast, thePitcher._id]);

  const handleVisibilityChange = async (
    id: string,
    visibility: Pitch["visibility"]
  ) => {
    try {
      await axios.put(`${BASE}/listings/${id}`, {
        visibility,
      });
      setPitcherData((prevData) =>
        prevData.map((pitch) =>
          pitch._id === id ? { ...pitch, visibility } : pitch
        )
      );
      toast({
        title: "Visibility Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRequestAcceptance = async (requestId: string) => {
    try {
      await axios.post(`${BASE}/pitchers/accept-connection-request/${requestId}`);
      toast({
        title: "Request Accepted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAccessRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRequestRejection = async (requestId: string) => {
    try {
      await axios.post(`${BASE}/pitchers/reject-connection-request/${requestId}`);
      toast({
        title: "Request Rejected",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAccessRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeInvestorId) return;

    try {
      await axios.post(`${BASE}/chat/pitcher-to-investor`, {
        senderId: thePitcher._id,
        receiverId: activeInvestorId,
        messageText: newMessage,
      });

      toast({
        title: "Message Sent",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const newConversation: Conversation = {
        _id: `${convoData.length + 1}`,
        message: newMessage,
        createdAt: new Date(),
        sender: thePitcher.username,
        type: "pitcher",
      };

      setConvoData([...convoData, newConversation]);
      setActiveConversations([...activeConversations, newConversation]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setNewMessage("");
    }
  };

  const handleOpenChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
    // Set the active investor ID here
    setActiveInvestorId(conversation.sender);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    setChatOpen(false);
    setActiveInvestorId("");
  };

  const MessageComponent = ({ message }: { message: Conversation }) => {
    const senderProfileUrl =
      message.type === "pitcher"
        ? `/pitcher/${message.sender}`
        : `/investor/${message.sender}`;

    return (
      <Text fontSize="sm" color="gray.500">
        <Link to={senderProfileUrl}>
          {moment(message.createdAt).fromNow()} by{" "}
          <Link to={`/listings/${message.sender}`}>{message.sender}</Link>
        </Link>
      </Text>
    );
  };

  return (
    <ChakraProvider>
      <Container maxW="7xl" py="12">
        <VStack spacing="8" align="stretch">
          <Link to={`/work/${thePitcher._id}`}>
            {`${thePitcher.username}'s WorkSpace`}
          </Link>
          <Flex justify="space-between" align="center" mb="6">
            <Heading size="lg">
              {thePitcher.username && `Welcome, ${thePitcher.username}!`}
            </Heading>
            <Button
              as={Link}
              to="/create"
              colorScheme="blue"
              leftIcon={<AddIcon />}
              variant="outline"
            >
              Create New Pitch
            </Button>
            <Button
              as={Link}
              to={`/work/${thePitcher._id}`}
              colorScheme="blue"
              leftIcon={<AddIcon />}
              variant="outline"
            >
              WorkSpace
            </Button>
          </Flex>

          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>Pitches</Tab>
              <Tab>Conversations</Tab>
              <Tab>Connection Requests</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {pitcherData.length === 0 && !loading ? (
                  <Text>No pitches found.</Text>
                ) : (
                  <VStack spacing="4" align="stretch">
                    {pitcherData.map((pitch) => (
                      <Box
                        key={pitch._id}
                        p="4"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        bg={bgColor}
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Heading size="md">
                              <Link to={`/listings/${pitch._id}`}>
                                {pitch.title}
                              </Link>
                            </Heading>
                            <Text fontSize="sm">
                              Created at: {moment(pitch.createdAt).format("MMMM D, YYYY")}
                            </Text>
                          </Box>
                          <Box>
                            <Select
                              value={pitch.visibility}
                              onChange={(e) =>
                                handleVisibilityChange(
                                  pitch._id,
                                  e.target.value as Pitch["visibility"]
                                )
                              }
                              size="sm"
                              maxW="140px"
                            >
                              <option value="public">Public</option>
                              <option value="pitchers">Pitchers Only</option>
                              <option value="private">Private</option>
                            </Select>
                          </Box>
                        </Flex>
                        <Flex justify="space-between" align="center" mt="4">
                          <HStack spacing="2">
                            <Button
                              as={Link}
                              to={`/listings/${pitch._id}`}
                              leftIcon={<ViewIcon />}
                              size="sm"
                            >
                              View
                            </Button>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            Views: {pitch.views}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>

              <TabPanel>
                <VStack spacing="4" align="stretch">
                  {activeConversations.length > 0 ? (
                    activeConversations.map((convo) => (
                      <Box
                        key={convo._id}
                        p="4"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        bg={bgColor}
                        borderColor={borderColor}
                      >
                        <HStack justify="space-between">
                          <MessageComponent message={convo} />
                          <IconButton
                            aria-label="View"
                            icon={<ViewIcon />}
                            size="sm"
                            onClick={() => handleOpenChat(convo)}
                          />
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Text>No conversations found.</Text>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                {accessRequests.length === 0 ? (
                  <Text>No connection requests found.</Text>
                ) : (
                  <VStack spacing="4" align="stretch">
                    {accessRequests.map((request) => (
                      <Box
                        key={request._id}
                        p="4"
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="md"
                        bg={bgColor}
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Link to={`/investor/${request.investorId}`}>
                              <Text fontWeight="bold">
                                {request.investorName}
                              </Text>
                              <Text fontSize="sm">
                                {moment(request.createdAt).fromNow()}
                              </Text>
                            </Link>
                          </Box>
                          <HStack spacing="2">
                            <IconButton
                              aria-label="Accept"
                              icon={<CheckIcon />}
                              size="sm"
                              onClick={() => handleRequestAcceptance(request._id)}
                            />
                            <IconButton
                              aria-label="Reject"
                              icon={<CloseIcon />}
                              size="sm"
                              onClick={() => handleRequestRejection(request._id)}
                            />
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {chatOpen && selectedConversation && (
        <Box
          position="fixed"
          bottom="0"
          right="0"
          m="4"
          p="4"
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          maxW="sm"
          bg={bgColor}
          borderColor={borderColor}
        >
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md">Chat</Heading>
            <IconButton
              aria-label="Close"
              icon={<CloseIcon />}
              size="sm"
              onClick={handleCloseChat}
            />
          </Flex>
          <VStack spacing="4" align="stretch">
            {convoData
              .filter((convo) => convo._id === selectedConversation._id)
              .map((convo) => (
                <Box key={convo._id}>
                  <MessageComponent message={convo} />
                  <Text>{convo.message}</Text>
                </Box>
              ))}
            <Box>
              <Input
                placeholder="Type your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button colorScheme="blue" mt="2" onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </VStack>
        </Box>
      )}
    </ChakraProvider>
  );
};

export default PitcherHome;