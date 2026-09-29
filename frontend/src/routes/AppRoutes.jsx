import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage.jsx";
import GoogleTest from "../pages/auth/GoogleTest.jsx";
import Signup from "../pages/auth/Signup.jsx";
import VoiceInterviewTest from "../pages/interview/VoiceInterviewTest.jsx";
import GeminiLiveInterviewTest from "../pages/interview/GeminiLiveInterviewTest.jsx";


import FAQ from "../pages/FAQ.jsx";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/google-test" element={<GoogleTest />} />

        <Route
          path="/interview/voice-test"
          element={<VoiceInterviewTest />}
        />

        <Route
          path="/interview/gemini-voice-test"
          element={<GeminiLiveInterviewTest />}
        />


        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;