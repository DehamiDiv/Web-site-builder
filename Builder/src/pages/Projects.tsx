import React, { useEffect, useState } from "react";

import { Loader2Icon } from "lucide-react";
import type { Project } from "../types";

const Projects = () => {
  const [project] = useState<Project | null>(null);
  const [loading] = useState(true);

  const fetchProject = async () => {};
  useEffect(() => {
    fetchProject();
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <Loader2Icon className="size-7 animate-spin text-violet-200" />
        </div>
      </>
    );
  }
  return project ? (
    <div>
      <h1>projects</h1>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load project!
      </p>
    </div>
  );
};

export default Projects;
