import React from "react";
import { Project, Message } from "../../types";
import { BotIcon, UserIcon } from "lucide-react";

interface SidebarProps {
    isMenuOpen: boolean;
    project:Project,
    setProject:(project:Project)=>  void;
    isgenerating: boolean;
    setIsGenerating: (isgenerating: boolean) => void;
}

const Sidebar = ({isMenuOpen, project, setProject, isgenerating, setIsGenerating}:
    SidebarProps
) => {
    return (
        <div
            className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border border-gray-800 transition-all ${
                isMenuOpen ? "max-sm:w-0 overflow-hidden" : "w-full"
            }`}
        >
            <div className="flex flex-col h-full">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((message) => {
                            const ismessage = 'content' in message;

                            if (ismessage) {
                                const msg = message as Message;
                                const isuser = msg.role === 'user';
                                return (
                                    <div key={msg.id} className={`flex items-start gap-3 ${isuser ? "justify-end" : "justify-start"}`}>
                                        {!isuser && (
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                                                <BotIcon className="size-5 text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isuser ? "bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none" : "rounded-full bg-gray-700 flex items-center justify-center"}`}>
                                            {msg.content}
                                        </div>
                                        {isuser && (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                <UserIcon className="size-5 text-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                            return null;
                        })}
                </div>
                {/*Input area*/}
                <form></form>

            </div>
        </div>
    )
}

export default Sidebar
 