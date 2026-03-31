import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface EditorPanelProps {
    selectedElement:{
        tagName: string;
        className: string;
        text :string;
        id: string;
        styles: {
            padding: string;
            margin: string;
            color: string;
            fontSize: string;
            fontWeight: string;
            textAlign: string;
            backgroundColor: string;
           
        }
    } | null;
    onUpdate: (updates:any)=>void;
    onClose: ()=>void;
}

const EditorPanel = ({selectedElement,onUpdate,onClose}:EditorPanelProps) => {
     const [values, setvalues] = useState(selectedElement);
        useEffect(()=>{
            setvalues(selectedElement)
        },[selectedElement])
        if(!selectedElement || !values) return null;
        const handleChange = (field:string,value:string)=>{
           const newValues = {...values,[field]:value};
           if(field in newValues.styles){
            newValues.styles = {...newValues.styles,[field]:value};
           }
           setvalues(newValues);
           onUpdate({[field]:value});
        }
        const handleStyleChange = (styleName:string,value:string)=>{
            const newStyles = {...values.styles,[styleName]:value};
            setvalues({...values,styles:newStyles});
            onUpdate({styles:{[styleName]:value}});
        }
    return (
       

<div className="absolute top-4 right-4 w-[340px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-50 animate-in fade-in slide-in-from-right-4">
    <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-gray-800">
           Edit Element
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4"/>
        </button>
    </div>

    <div className="space-y-4">
        {/* Text Content */}
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Text Content
            </label>
            <textarea 
                value={values.text || ''} 
                onChange={(e)=>handleChange("text",e.target.value)} 
                className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                rows={3}
            />
        </div>

        {/* Class Name */}
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Class Name
            </label>
            <input 
                type="text" 
                value={values.className || ''} 
                onChange={(e)=>handleChange("className",e.target.value)} 
                className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>

        {/* Grid 1: Layout & Typography */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Padding</label>
                <input type="text" value={values.styles.padding || ''} onChange={(e)=>handleStyleChange("padding",e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Margin</label>
                <input type="text" value={values.styles.margin || ''} onChange={(e)=>handleStyleChange("margin",e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Font Size</label>
                <input type="text" value={values.styles.fontSize || ''} onChange={(e)=>handleStyleChange("fontSize",e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Font Weight</label>
                <input type="text" value={values.styles.fontWeight || ''} onChange={(e)=>handleStyleChange("fontWeight",e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
        </div>

        {/* Grid 2: Colors and alignment */}
        <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Align</label>
                <div className="flex bg-gray-100 p-1 rounded-md">
                    {['left', 'center', 'right', 'justify'].map(align => (
                        <button
                            key={align}
                            onClick={() => handleStyleChange("textAlign", align)}
                            className={`flex-1 py-1 text-xs rounded uppercase font-medium transition-colors ${values.styles.textAlign === align ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {align}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Background</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1.5 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
                    <input 
                        type="color" 
                        value={(!values.styles.backgroundColor || values.styles.backgroundColor.includes('rgba') || values.styles.backgroundColor.includes('oklch')) ? '#ffffff' : values.styles.backgroundColor} 
                        onChange={(e)=>handleStyleChange("backgroundColor",e.target.value)} 
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0 flex-shrink-0"
                    />
                    <input 
                        type="text" 
                        value={values.styles.backgroundColor || ''} 
                        onChange={(e)=>handleStyleChange("backgroundColor",e.target.value)}
                        className="w-full text-[11px] text-gray-700 outline-none bg-transparent"
                        placeholder="none"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Text Color</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1.5 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
                    <input 
                        type="color" 
                        value={(!values.styles.color || values.styles.color.includes('oklch') || values.styles.color.includes('rgba')) ? '#000000' : values.styles.color} 
                        onChange={(e)=>handleStyleChange("color",e.target.value)} 
                        className="w-5 h-5 rounded cursor-pointer border-0 p-0 flex-shrink-0"
                    />
                    <input 
                        type="text" 
                        value={values.styles.color || ''} 
                        onChange={(e)=>handleStyleChange("color",e.target.value)}
                        className="w-full text-[11px] text-gray-700 outline-none bg-transparent"
                        placeholder="inherit"
                    />
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default EditorPanel; 