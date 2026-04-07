import React, { useState } from 'react';
import Notification from '../common/Notification';

const IAAdvisorButton: React.FC = () => {
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleClick = () => {
    setNotification({
      message: "Funcionalidad de Asesor de IA en desarrollo. ¡Próximamente disponible para optimizar sus presupuestos!",
      type: 'info'
    });
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center space-x-2 transition-colors duration-200 opacity-50 cursor-not-allowed z-50"
        disabled
        title="Asesor de IA (Próximamente)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="14" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></rect>
          <line x1="9" y1="1" x2="9" y2="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="15" y1="1" x2="15" y2="5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="9" y1="19" x2="9" y2="23" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="15" y1="19" x2="15" y2="23" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="1" y1="9" x2="5" y2="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="1" y1="15" x2="5" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="19" y1="9" x2="23" y2="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
          <line x1="19" y1="15" x2="23" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></line>
        </svg>
        <span>Asesor IA</span>
      </button>

      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type as any}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
    </>
  );
};

export default IAAdvisorButton;
