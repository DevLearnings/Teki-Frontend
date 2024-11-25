import React, { createContext, useState, useContext } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./Components/Home/Home";
import Listings from "./Components/Listings/Listings";
import LandingPage from "./Components/LandingPage/LandingPage";
import PitcherHome from "./Components/Home/PitcherHome";
import ChatBot from "./Components/Chat/ChatBot";
import Donate from "./Components/Donate/Donate";
import NotFound from "./Components/Exceptions/NotFound";
import PitcherProfile from "./Components/Pitchers/PitcherProfile";
import InvestorProfile from "./Components/Investors/InvestorProfile";
import GetStarted from "./Components/GetStarted/GetStarted";
import InvestorDashboard from "./Components/Investors/InvestorDashboard";
import WorkspaceComponent from "./Components/Workspace/Workspace";
import InvestorLogin from "./Components/Investors/InvestorLogin";
import InvestorRegister from "./Components/Investors/InvestorRegister";
import PitcherLogin from "./Components/Pitchers/PitcherLogin";
import PitcherRegister from "./Components/Pitchers/PitcherRegister";
import ForgotPasswordInvestor from "./Components/Investors/ForgotPasswordInvestor";
import ForgotPasswordPitchers from "./Components/Pitchers/ForgotPasswordPitchers";
import CreateListing from "./Components/Listings/CreateListing";
import AdminDashboardWithErrorBoundary from "./Components/Admin/AdminDashboard";
import "./Components/Workspace/ErrorBoundary";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";

interface Investor {
  _id?: string;
  // Define other properties of the investor object here
}

interface Pitcher {
  _id?: string;
  // Define the properties of the pitcher object here
}

interface BotData {
  // Define the properties of the bot data object here
}

interface Business {
  // Define the properties of the business object here
}

interface TekiContextType {
  investor: Investor[];
  setInvestor: React.Dispatch<React.SetStateAction<Investor[]>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  BASE: string;
  thePitcher: Pitcher[];
  setThePitcher: React.Dispatch<React.SetStateAction<Pitcher[]>>;
  toggleBot: boolean;
  setToggleBot: React.Dispatch<React.SetStateAction<boolean>>;
  botData: BotData[];
  setBotData: React.Dispatch<React.SetStateAction<BotData[]>>;
  pack: string;
  setPackage: React.Dispatch<React.SetStateAction<string>>;
  business: Business;
  setBusiness: React.Dispatch<React.SetStateAction<Business>>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  navigator: ReturnType<typeof useNavigate>;
}

export const TekiContext = createContext<TekiContextType | undefined>(
  undefined
);

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [investor, setInvestor] = useState<Investor[]>([]);
  const [toggleBot, setToggleBot] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [thePitcher, setThePitcher] = useState<Pitcher[]>([]);
  const [botData, setBotData] = useState<BotData[]>([]);
  const [pack, setPackage] = useState<string>("free");
  const [business, setBusiness] = useState<Business>({});
  const [theme, setTheme] = useState<string>("dark");

  const BASE: string = "http://localhost:8000";

  const theStates: TekiContextType = {
    investor,
    setInvestor,
    status,
    setStatus,
    loading,
    setLoading,
    BASE,
    thePitcher,
    setThePitcher,
    toggleBot,
    setToggleBot,
    botData,
    setBotData,
    pack,
    setPackage,
    business,
    setBusiness,
    theme,
    setTheme,
  };

  return (
    <TekiContext.Provider value={theStates}>
      <ChatBot />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                investor.length ? (
                  <Home />
                ) : thePitcher ? (
                  <PitcherHome />
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route
              path="/investorboard/:investorId"
              element={<InvestorDashboard />}
            />
            <Route path="/investorlog" element={<InvestorLogin />} />
            <Route path="/pitcherlog" element={<PitcherLogin />} />
            <Route path="/investoreg" element={<InvestorRegister />} />
            <Route path="/pitchereg" element={<PitcherRegister />} />
            <Route path="/listing/:listingId" element={<Listings />} />
            <Route path="/pitcher/:pitcherId" element={<PitcherProfile />} />
            <Route path="/investor/:investorId" element={<InvestorProfile />} />
            <Route
              path="/forgotpass/investor"
              element={<ForgotPasswordInvestor />}
            />
            <Route
              path="/forgotpass/pitcher"
              element={<ForgotPasswordPitchers />}
            />
            <Route path="/create" element={<CreateListing />} />
            {/* <Route path="/work/:userId" element={<WorkspaceComponent />} /> *Ignore for now! */}
            <Route path="/donate" element={<Donate />} /> {/**Avisha */}
            <Route
              path="/admin"
              element={<AdminDashboardWithErrorBoundary />}
            />
            <Route path="/getstarted" element={<GetStarted />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TekiContext.Provider>
  );
};

export default App;
