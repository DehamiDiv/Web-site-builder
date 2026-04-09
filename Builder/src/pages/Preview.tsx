import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import type { Project } from "../types";
import ProjectPreview from "../assets/components/ProjectPreview";
import api from "@/config/axios";
import { toast } from "sonner";

const Preview = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/project/code/${projectId}`);
        if (data.code) {
          setCode(data.code);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to load preview code");
      } finally {
        setLoading(false);
      }
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
