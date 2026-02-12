
import React, { useState, useEffect, useRef } from 'react';
import { GlobalState, NotificationType } from '../types';

interface Props {
  userWallet: GlobalState['userWallet'];
  pendingRequest: GlobalState['pendingPaymentRequest'];
  isMobileConnected: boolean;
  watchAlert: { message: string; type: NotificationType } | null;
  onToggleActive: () => void;
  onProcessPayment: (approve: boolean) => void;
}

const Smartwatch: React.FC<Props> = ({ userWallet, pendingRequest, isMobileConnected, watchAlert, onToggleActive, onProcessPayment }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [showHistory, setShowHistory] = useState(false);
  const [shakeClass, setShakeClass] = useState('');
  
  const prevActiveRef = useRef(userWallet.isActive);
  const prevAlertRef = useRef(watchAlert);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout: number;
    
    const triggerShake = (intensity: 'light' | 'heavy') => {
      setShakeClass(intensity === 'heavy' ? 'animate-watch-shake-heavy' : 'animate-watch-shake-light');
      clearTimeout(timeout);
      timeout = window.setTimeout(() => setShakeClass(''), 300);
    };

    if (watchAlert && watchAlert !== prevAlertRef.current) {
      triggerShake(watchAlert.type === 'error' ? 'heavy' : 'light');
    } 
    else if (userWallet.isActive !== prevActiveRef.current) {
      triggerShake('light');
    }

    prevActiveRef.current = userWallet.isActive;
    prevAlertRef.current = watchAlert;

    return () => clearTimeout(timeout);
  }, [watchAlert, userWallet.isActive]);

  const bluetoothColorClass = pendingRequest 
    ? 'text-green-400 blinking-green !shadow-none' 
    : (isMobileConnected ? 'text-blue-400 animate-pulse' : 'text-slate-700');

  const isEmergency = pendingRequest && userWallet.balance < pendingRequest.amount;
  const emergencyFee = pendingRequest ? (pendingRequest.amount * 0.04) : 0;

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-24 h-48 bg-slate-800 rounded-t-3xl border-x border-t border-slate-700 mb-[-60px] shadow-lg"></div>

      <div className={`relative z-10 w-72 h-72 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-2 transition-transform duration-75 ${shakeClass}`}>
        <div 
          className="watch-face relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none"
        >
          
          <div className="absolute top-5 flex flex-col items-center z-20">
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`transition-colors duration-500 ${bluetoothColorClass}`}>
                <i className="fab fa-bluetooth-b text-[8px]"></i>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="text-[7px] font-bold">85%</span>
                <i className="fas fa-battery-three-quarters text-[8px]"></i>
              </div>
            </div>
            <div className="text-[9px] font-black text-slate-300 tracking-widest uppercase">
              {time}
            </div>
          </div>

          {watchAlert ? (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center gap-3 w-full h-full bg-slate-950/40 absolute inset-0 z-[30] rounded-full">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${watchAlert.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                <i className={`fas ${watchAlert.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} text-xl`}></i>
              </div>
              <p className={`text-[11px] font-black uppercase tracking-widest px-8 leading-tight ${watchAlert.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {watchAlert.message}
              </p>
              <div className="w-12 h-0.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress-watch"></div>
              </div>
            </div>
          ) : pendingRequest ? (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2 w-full mt-10">
              <div className="flex flex-col items-center gap-0.5">
                 {isEmergency && (
                   <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-black tracking-widest mb-1 animate-pulse">EMERGENCY ZiP</span>
                 )}
                 <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Request From</p>
                 <h4 className="text-xs font-semibold truncate max-w-full mb-1">{pendingRequest.from}</h4>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-black text-indigo-400">₹{pendingRequest.amount}</div>
                {isEmergency && (
                  <p className="text-[8px] font-bold text-slate-500 mt-0.5">+₹{emergencyFee.toFixed(2)} Fee</p>
                )}
              </div>

              <div className="flex gap-4 mt-1">
                <button 
                  onClick={() => onProcessPayment(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
                <button 
                  onClick={() => onProcessPayment(true)}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-green-500 shadow-lg shadow-indigo-600/20 text-white flex items-center justify-center transition-all"
                >
                  <i className="fas fa-check text-lg"></i>
                </button>
              </div>
            </div>
          ) : showHistory ? (
            <div className="flex flex-col items-center w-full h-full mt-12 px-2 animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center w-full mb-2">
                 <p className="text-[9px] font-bold text-slate-500 uppercase">History</p>
                 <button onClick={() => setShowHistory(false)} className="text-[10px] text-indigo-400 font-bold uppercase">Back</button>
               </div>
               <div className="w-full flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-10">
                 {userWallet.pendingSync.length === 0 ? (
                   <p className="text-[9px] text-slate-600 py-8 font-bold uppercase tracking-widest">No local transactions</p>
                 ) : (
                   userWallet.pendingSync.map(tx => (
                     <div key={tx.id} className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <div className="text-left">
                          <p className="text-[9px] font-bold truncate max-w-[80px]">{tx.peer}</p>
                          <p className="text-[7px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="text-[9px] font-black text-slate-300">-₹{tx.amount}</p>
                     </div>
                   ))
                 )}
               </div>
            </div>
          ) : (
            <>
              <div 
                className="mt-6 cursor-pointer active:scale-95 transition-transform flex flex-col items-center" 
                onClick={() => setShowHistory(true)}
                title="Tap for history"
              >
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <i className="fas fa-bolt text-white text-[10px]"></i>
                  </div>
                  <p className="text-[8px] text-indigo-400 font-black uppercase tracking-[0.25em]">ZiP WALLET</p>
                </div>

                <h3 className={`text-4xl font-bold mb-0.5 tracking-tight ${userWallet.balance < 0 ? 'text-red-400' : ''}`}>₹{userWallet.balance.toFixed(0)}</h3>
                <p 
                  key={userWallet.isActive ? 'ready' : 'inactive'}
                  className={`text-[10px] font-bold mb-4 status-fade-animation ${userWallet.isActive ? (userWallet.balance < 0 ? 'text-red-500' : 'text-indigo-400') : 'text-red-500'}`}
                >
                  {userWallet.balance < 0 ? 'DEBT' : (userWallet.isActive ? 'READY' : 'INACTIVE')}
                </p>
              </div>
              
              <button 
                onClick={onToggleActive}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 ${userWallet.isActive ? (userWallet.balance < 0 ? 'blinking-red bg-red-500' : 'blinking-green bg-green-500') : 'blinking-red bg-red-500'}`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </button>

              <div className="absolute bottom-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < userWallet.offlineCount ? 'bg-indigo-500' : 'bg-slate-700'}`}
                  ></div>
                ))}
              </div>
            </>
          )}

          <div className="absolute inset-0 border border-slate-800/50 rounded-full pointer-events-none m-4"></div>
        </div>

        <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-4 h-10 bg-slate-700 rounded-r-lg border-y border-r border-slate-600"></div>
      </div>

      <div className="w-24 h-48 bg-slate-800 rounded-b-3xl border-x border-b border-slate-700 mt-[-60px] shadow-lg"></div>

      <style>{`
        @keyframes progress-watch {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes status-fade {
          from { opacity: 0; transform: scale(0.85); filter: blur(4px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes watch-shake-light {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
        }
        @keyframes watch-shake-heavy {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-4px, 0); }
          20% { transform: translate(4px, 0); }
          30% { transform: translate(-4px, 0); }
          40% { transform: translate(4px, 0); }
          50% { transform: translate(-4px, 0); }
          60% { transform: translate(4px, 0); }
          70% { transform: translate(-4px, 0); }
          80% { transform: translate(4px, 0); }
          90% { transform: translate(-4px, 0); }
        }
        .animate-progress-watch {
          animation: progress-watch 3.5s linear forwards;
        }
        .status-fade-animation {
          animation: status-fade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-watch-shake-light {
          animation: watch-shake-light 0.1s linear infinite;
        }
        .animate-watch-shake-heavy {
          animation: watch-shake-heavy 0.2s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Smartwatch;
