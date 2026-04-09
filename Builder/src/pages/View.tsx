import { useState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../assets/components/ProjectPreview";
import type { Project } from "../types";
import { useParams } from "react-router-dom";
import api from "@/config/axios";
import { toast } from "sonner";

const View = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/project/published/${projectId}`);
      if (data.code) {
        setCode(data.code);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to load project code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  return (
    <div className="h-screen">
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

export default View;
