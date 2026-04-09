import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import type { Project } from "../types";
import ProjectPreview from "../assets/components/ProjectPreview";
import api from "@/config/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const { projectId, versionId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      toast.error("Please login to continue");
      navigate("/");
      return;
    }

    const fetchCode = async () => {
      try {
        setLoading(true);
        const url = versionId 
          ? `/api/project/code/${projectId}/${versionId}` 
          : `/api/project/code/${projectId}`;
        const { data } = await api.get(url);
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
  }, [projectId, versionId, session, isPending, navigate]);

  if (loading || isPending) {
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
