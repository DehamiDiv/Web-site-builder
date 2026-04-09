import {
  FileSearchIcon,
  SparklesIcon,
  CodeIcon,
  CircleCheckIcon,
} from "lucide-react";

const steps = [
  {
    icon: FileSearchIcon,
    title: "Analyzing your request...",
    description: "This may take around 2-3 minutes...",
  },
  {
    icon: SparklesIcon,
    title: "Generating design...",
    description: "Creating beautiful layouts and styles...",
  },
  {
    icon: CodeIcon,
    title: "Writing code...",
    description: "Building your website with clean HTML/CSS...",
  },
  {
    icon: CircleCheckIcon,
    title: "Finalizing...",
    description: "Preparing your website for preview...",
  },
];

interface LoaderStepsProps {
  currentStep: number;
}

export default function LoaderSteps({ currentStep }: LoaderStepsProps) {
  const step = steps[currentStep] || steps[0];
  const Icon = step.icon;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-600/30 blur-3xl rounded-full animate-pulse" />
        <Icon className="relative w-16 h-16 text-white animate-pulse drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          {step.title}
        </h3>
        <p className="text-xs text-gray-400 font-medium whitespace-nowrap opacity-80">
          {step.description}
        </p>
      </div>

      <div className="flex gap-1.5 pt-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentStep ? "w-8 bg-violet-500" : "w-2 bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
