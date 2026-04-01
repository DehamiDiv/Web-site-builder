import {
  ScanLineIcon,
  SparklesIcon,
  CodeIcon,
  CheckCircleIcon,
} from "lucide-react";

const steps = [
  {
    icon: ScanLineIcon,
    title: "Analyzing your request",
    description: "Breaking down your ideas into actionable steps",
  },
  {
    icon: SparklesIcon,
    title: "Generating design",
    description: "Creating beautiful layouts and styles",
  },
  {
    icon: CodeIcon,
    title: "Writing code",
    description: "Building your website with clean HTML/CSS",
  },
  {
    icon: CheckCircleIcon,
    title: "Ready to launch",
    description: "Your website is ready to preview and deploy",
  },
];



interface LoaderStepsProps {
  currentStep: number;
}

export default function LoaderSteps({ currentStep }: LoaderStepsProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={index} className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-violet-600 text-white" : isCurrent ? "bg-violet-500 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              <Icon
                className={`w-5 h-5 ${isCompleted ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold mb-1 ${isCompleted || isCurrent ? "text-white" : "text-gray-400"}`}
              >
                {step.title}
              </h4>
              <p
                className={`text-xs ${isCompleted || isCurrent ? "text-gray-300" : "text-gray-500"}`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
