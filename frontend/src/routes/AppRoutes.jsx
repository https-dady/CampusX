import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage.jsx";
// import GoogleTest from "../pages/auth/GoogleTest.jsx";
import Signup from "../pages/auth/Signup.jsx";
import VoiceInterviewTest from "../pages/interview/VoiceInterviewTest.jsx";
import GeminiLiveInterviewTest from "../pages/interview/GeminiLiveInterviewTest.jsx";

import FAQ from "../pages/FAQ.jsx";

import WorkspaceLayout from "../components/layout/WorkspaceLayout.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

import Overview from "../pages/dashboard/Overview.jsx";
import MyProfile from "../pages/profile/MyProfile.jsx";
import SkillsInterests from "../pages/profile/SkillsInterests.jsx";
import CareerInsights from "../pages/career/CareerInsights.jsx";
import Assessment from "../pages/assessment/Assessment";
import LearningRoadmap from "../pages/learning/LearningRoadmap.jsx";
import CoursesResources from "../pages/learning/CoursesResources";
import ResumeAnalysis from "../pages/profile/ResumeAnalysis";
import MockInterview from "../pages/interview/MockInterview.jsx";
import Community from "../pages/community/Community.jsx";
import Feedback from "../pages/feedback/Feedback.jsx";
import Jobs from "../pages/jobs/Jobs.jsx";

import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* <Route
          path="/google-test"
          element={<GoogleTest />}
        /> */}

        <Route
          path="/interview/voice-test"
          element={<VoiceInterviewTest />}
        />

        <Route
          path="/interview/gemini-voice-test"
          element={<GeminiLiveInterviewTest />}
        />

        <Route
          path="/faq"
          element={<FAQ />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />


        {/* =========================
            PROTECTED WORKSPACE ROUTES
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={
              <WorkspaceLayout>
                <Overview />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <WorkspaceLayout>
                <MyProfile />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/assessment"
            element={
              <WorkspaceLayout>
                <Assessment />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/skills-interests"
            element={
              <WorkspaceLayout>
                <SkillsInterests />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/career-insights"
            element={
              <WorkspaceLayout>
                <CareerInsights />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/learning-roadmap"
            element={
              <WorkspaceLayout>
                <LearningRoadmap />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/courses-resources"
            element={
              <WorkspaceLayout>
                <CoursesResources />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/resume-analysis"
            element={
              <WorkspaceLayout>
                <ResumeAnalysis />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/interview/mock"
            element={
              <WorkspaceLayout>
                <MockInterview />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/community"
            element={
              <WorkspaceLayout>
                <Community />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/feedback"
            element={
              <WorkspaceLayout>
                <Feedback />
              </WorkspaceLayout>
            }
          />

          <Route
            path="/jobs"
            element={
              <WorkspaceLayout>
                <Jobs />
              </WorkspaceLayout>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;