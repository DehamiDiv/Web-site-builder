import { useState, useEffect } from "react";
import { dummyProjects } from "../assets/assets";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import type { Project } from "../types";
import ProjectPreview from "../assets/components/ProjectPreview";

const Preview = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      setTimeout(() => {
        const project = dummyProjects.find((project) => project.id === projectId);
        if (project?.current_code) {
          setCode(project.current_code);
        }
        setLoading(false);
      }, 2000);
    };

    fetchCode();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }
  return (
    <div className="h-screen bg-white">
      {code && (
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false}
          showEditorPanel={false}
        />
      )}
    </div>
  );
};

export default Preview;
