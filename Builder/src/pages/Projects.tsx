import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/config/axios";
import type { Project } from "../types";
import type { ProjectPreviewRef } from "../assets/components/ProjectPreview";
import Sidebar from "../assets/components/Sidebar";
import ProjectPreview from "../assets/components/ProjectPreview";
import {
  Loader2Icon,
  MessageSquareIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
  MonitorIcon,
  SaveIcon,
  FullscreenIcon,
  ArrowBigDownDash,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";

const Projects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving] = useState(false);
  const previewRef = useRef<ProjectPreviewRef>(null);
  const [isgenerating, setIsGenerating] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(`/api/user/project/${projectId}`);
      if (data.project) {
        setProject(data.project);
      } else {
        toast.error("Project not found");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) return;
    try {
      const { data } = await api.post(`/api/project/save/${projectId}`, { code });
      toast.success(data.message || "Project saved successfully!");
      fetchProject();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to save project");
    }
  };

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const togglePublish = async () => {
    try {
      const { data } = await api.post(`/api/user/purchase-toggle/${projectId}`);
      setProject((prev) => prev ? { ...prev, isPublished: data.isPublished } : prev);
      toast.success(data.message);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to toggle publish status");
    }
  };
  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* builder navbar */}
      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar">
        {/* left */}
        <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
          <img
            src="/favicon.svg"
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="max-w-64 sm:max-w-xs">
            <p className="text-sm text-medium capitalize truncate">
              {project.name}
            </p>
            <p className="text-xs text-gray-400 -mt-0.5">
              Previewing last saved version
            </p>
          </div>
          <div className="sm:hidden flex-1 flex justify-end">
            {isMenuOpen ? (
              <XIcon
                onClick={() => setIsMenuOpen(false)}
                className="size-5 text-gray-400 cursor-pointer"
              />
            ) : (
              <MessageSquareIcon
                onClick={() => setIsMenuOpen(true)}
                className="size-5 text-gray-400 cursor-pointer"
              />
            )}
          </div>
        </div>
        {/* middle */}
        <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setDevice("mobile")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "mobile" ? "bg-gray-700" : ""}`}
          />
          <TabletIcon
            onClick={() => setDevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""}`}
          />
          <MonitorIcon
            onClick={() => setDevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""}`}
          />
        </div>
        {/* right */}
        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          <button
            disabled={isSaving}
            onClick={saveProject}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>
          <Link
            target="_blank"
            to={`/preview/${project.id}`}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700"
          >
            <FullscreenIcon size={16} />
            Preview
          </Link>
          <button
            onClick={downloadCode}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700"
          >
            <ArrowBigDownDash size={16} /> Download
          </button>
          <button
            onClick={togglePublish}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700"
          >
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-auto">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={setProject}
          isgenerating={isgenerating}
          setIsGenerating={setIsGenerating}
        />
        <div className="flex-1 p-2 pl-0">
          <ProjectPreview
            ref={previewRef}
            project={project}
            device={device}
            isGenerating={isgenerating}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-400">
        Unable to load project!
      </p>
    </div>
  );
};

export default Projects;
