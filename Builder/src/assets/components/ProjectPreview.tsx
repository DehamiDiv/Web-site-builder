import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Project } from "../../types";
import { iframeScript } from "../assets";
import EditorPanel from "./EditorPanel";

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: "desktop" | "tablet" | "mobile";
  showEditorPanel?: boolean;
}
export interface ProjectPreviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  (
    { project, isGenerating, device = "desktop", showEditorPanel = true },
    ref,
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedElement, setSelectedElement] = useState<any>(null);
    useImperativeHandle(ref, () => ({
      getCode: () => iframeRef.current?.srcdoc,
    }));
    const resolutions = {
      desktop: "w-full",
      tablet: "w-[768px]",
      mobile: "w-[412px]",
    };
    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return "";
        
        const body = doc.querySelector("body");
        if (!body) return undefined;
        
        doc.querySelectorAll(".ai-selected-element, [data-ai-selected]").forEach((el) => {
          el.classList.remove('ai-selected-element');
          el.removeAttribute('data-ai-selected');
          (el as HTMLElement).style.outline = "";
        });

        const preViewStyle = doc.getElementById("ai-preview-style");
        if (preViewStyle) preViewStyle.remove();

        const previewscript = doc.getElementById("ai-preview-script");
        if (previewscript) previewscript.remove();

        return doc.documentElement.outerHTML;
      }
    }));
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "ELEMENT_SELECTED") {
          setSelectedElement(event.data.payload);
        } else if (event.data.type === "CLEAR_SELECTION") {
          setSelectedElement(null);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, []);
    const handleUpdate = useCallback(
      (updates: any) => {
        if (!selectedElement) return;
        const updatedElement = { ...selectedElement, ...updates };
        setSelectedElement(updatedElement);
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "UPDATE_ELEMENT",
            payload: updatedElement,
          },
          "*",
        );
      },
      [selectedElement],
    );
    const injectPreview = (html: string) => {
      if (!html) return "";
      if (!showEditorPanel) return html;
      if (html.includes("</body>")) {
        return html.replace("</body>", iframeScript + "</body>");
      } else {
        return html + iframeScript;
      }
    };
    return (
      <div className="relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2">
        {project.current_code ? (
          <>
            <iframe
              ref={iframeRef}
              srcDoc={injectPreview(project.current_code)}
              className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}
            />
            {showEditorPanel && (
              <EditorPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdate}
                onClose={() => {
                  setSelectedElement(null);
                  iframeRef.current?.contentWindow?.postMessage(
                    {
                      type: "CLEAR_SELECTION_REQUEST",
                    },
                    "*",
                  );
                }}
              />
            )}
          </>
        ) : (
          isGenerating && <div>loading...</div>
        )}
      </div>
    );
  },
);

export default ProjectPreview;
