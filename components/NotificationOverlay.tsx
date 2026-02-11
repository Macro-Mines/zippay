
import React, { useEffect, useState } from 'react';
import { NotificationType } from '../types';

interface Props {
  message: string;
  type: NotificationType;
  duration: number;
  onClose: () => void;
}

const NotificationOverlay: React.FC<Props> = ({ message, type, duration, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      icon: 'fa-check-circle',
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      progress: 'bg-green-500'
    },
    error: {
      icon: 'fa-exclamation-triangle',
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      progress: 'bg-red-500'
    },
    info: {
      icon: 'fa-info-circle',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-500/50',
      progress: 'bg-indigo-500'
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsClosing(true)}></div>
      
      <div className={`relative w-full max-w-xs bg-slate-900 border ${style.border} rounded-3xl p-6 shadow-2xl pointer-events-auto transform transition-all duration-300 ${isClosing ? 'scale-95' : 'scale-100 animate-in zoom-in-95'}`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 rounded-full ${style.bg} flex items-center justify-center`}>
            <i className={`fas ${style.icon} ${style.color} text-2xl`}></i>
          </div>
          
          <div className="space-y-1">
            <h3 className={`font-bold text-lg ${style.color} uppercase tracking-wider`}>
              {type === 'success' ? 'Success' : type === 'error' ? 'Action Required' : 'Update'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {message}
            </p>
          </div>
        </div>

        {/* Timer Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 rounded-b-3xl overflow-hidden">
          <div 
            className={`h-full ${style.progress} transition-all linear`}
            style={{ 
              width: '0%', 
              animation: `progress-shrink ${duration}ms linear forwards` 
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationOverlay;
