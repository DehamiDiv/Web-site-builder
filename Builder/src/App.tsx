import { Routes, Route } from "react-router-dom";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProject";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";
import Navbar from "./assets/components/Navbar";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AuthPage from "./pages/auth/AuthPage";
import Settings from "./pages/Settings";
import Loading from "./pages/Loading";

const App = () => {
  const { pathname } = useLocation();
  const hideNavbar =
    (pathname.startsWith("/projects") && pathname !== "/projects") ||
    pathname.startsWith("/view") ||
    pathname.startsWith("/preview");
  return (
    <div>
      <Toaster />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/pricing" element={<Pricing />}></Route>
        <Route path="/projects/:projectId" element={<Projects />}></Route>
        <Route path="/projects" element={<MyProjects />}></Route>
        <Route path="/preview/:projectId" element={<Preview />}></Route>
        <Route
          path="/preview/:projectId/:versionId"
          element={<Preview />}
        ></Route>
        <Route path="/community" element={<Community />}></Route>
        <Route path="/view/:projectId" element={<View />}></Route>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </div>
  );
};

export default App;
