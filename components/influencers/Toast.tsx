"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-md animate-slide-in">
      {message}
    </div>
  );
};

export default Toast;
