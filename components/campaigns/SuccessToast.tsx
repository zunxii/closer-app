import { CheckCircle } from "lucide-react";

export default function SuccessToast() {
  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg animate-pulse z-50">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">All leads submitted successfully!</span>
      </div>
    </div>
  );
}