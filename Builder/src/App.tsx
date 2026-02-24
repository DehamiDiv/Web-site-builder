import { Routes, Route } from "react-router-dom";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProject";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";

const App = () => {
  return (
    <div>
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
      </Routes>
    </div>
  );
};

export default App;
