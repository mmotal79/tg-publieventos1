import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  const baseClasses = "fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 transition-all duration-300 transform";
  let typeClasses = "";

  switch (type) {
    case 'success':
      typeClasses = "bg-green-500 text-white";
      break;
    case 'error':
      typeClasses = "bg-red-500 text-white";
      break;
    case 'info':
    default:
      typeClasses = "bg-blue-500 text-white";
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Cerrar notificación"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Notification;
