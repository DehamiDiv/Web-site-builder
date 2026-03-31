import type { Project, Message, Version } from "../../types";
import {
  BotIcon,
  UserIcon,
  EyeIcon,
  SendIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isgenerating: boolean;
  setIsGenerating: (isgenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, isgenerating, setIsGenerating }: SidebarProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const handleRollback = async (_versionId: string) => {};

  const handleRevisions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
    setInput("");
  };
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [project.conversation.length, isgenerating]);
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
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            )
            .map((message) => {
              const ismessage = "content" in message;

              if (ismessage) {
                const msg = message as Message;
                const isuser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isuser ? "justify-end" : "justify-start"}`}
                  >
                    {!isuser && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                        <BotIcon className="size-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isuser ? "bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none" : "rounded-full bg-gray-700 flex items-center justify-center"}`}
                    >
                      {msg.content}
                    </div>
                    {isuser && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="size-5 text-gray-200" />
                      </div>
                    )}
                  </div>
                );
              } else {
                const ver = message as Version;
                return (
                  <div
                    key={ver.id}
                    className="flex flex-col gap-2 w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow"
                  >
                    <div className="text-xs font-medium">
                      Code updated <br />
                      <span className="text-gray-500 text-xs font-normal">
                        {new Date(ver.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {project.current_version_index === ver.id ? (
                        <button className="px-3 py-1 rounded-md text-xs bg-gray-700">
                          Current version
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRollback(ver.id)}
                          className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                          Roll back to this version
                        </button>
                      )}
                      <Link
                        target="_blank"
                        to={`/preview/${project.id}/${ver.id}`}
                      >
                        <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded" />
                      </Link>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          {isgenerating && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <BotIcon className="size-5 text-white" />
              </div>
              <div className="flex gap-1.5 h-full items-end p-2 pb-3">
                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0s" }}
                />

                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.2s" }}
                />

                <span
                  className="size-2 rounded-full animate-bounce bg-gray-600"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
          <div ref={messageRef}></div>
        </div>
        {/*Input area*/}
        <form onSubmit={handleRevisions} className="m-3 relative">
          <div className="flex items-center gap-2">
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              rows={4}
              placeholder="Describe your website or request changes..."
              className="flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all"
              disabled={isgenerating}
            />
            <button
              disabled={isgenerating || !input.trim()}
              className="absolutebottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to:indigo-700 text-white transition-colors disabled:opacity-60"
            >
              {isgenerating ? (
                <Loader2Icon className="size-7 p-1.5 text-white animate-spin" />
              ) : (
                <SendIcon className="size-7 p-1.5 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
