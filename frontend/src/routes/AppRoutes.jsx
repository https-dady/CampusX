import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import App from "../App.jsx";
import GoogleTest from "../pages/auth/GoogleTest.jsx";
import Signup from "../pages/auth/Signup.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/google-test"
          element={<GoogleTest />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;