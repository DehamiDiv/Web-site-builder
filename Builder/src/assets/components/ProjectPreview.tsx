import React, { forwardRef } from "react";
import type { Project } from "../../types";
import { iframeScript } from "../assets";

interface ProjectPreviewProps {
    project : Project;
    isgenerating : boolean;
    device : 'desktop' | 'tablet' | 'mobile';
    showEditorPanel : boolean;
}
export interface ProjectPreviewRef {
    getCode : () => string|undefined;
}



const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps> (({project,isgenerating,device = 'desktop',showEditorPanel = true},ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const resolutions = {
        desktop : 'w-[412px]',
        tablet : 'w-[768px]',
        mobile : 'w-full',
    }
    const injectPreview = (htmi:string)=>{
        if(!html) return '';
        if(!showEditorPanel) return html;
        if(htmi.includes('</body')){
            return html.replace('</body>',iframeScript + '</body>')
        }else{
            return html + iframeScript;
        }
    }
    return (
        <div className="relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2">
            {project.current_code ? (
                <>
                <iframe ref={iframeRef}
                srcDoc={injectPreview(project.current_code)}
                className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}
                />
                </>
            ):isGenerating && (
                <div>loading...</div>
                
            )}
            
        </div>
    );
};

export default ProjectPreview;  