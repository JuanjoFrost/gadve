import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success", duration = 2500) => {
    setToast({
      visible: true,
      message,
      type,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};