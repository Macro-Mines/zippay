
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Bluetooth icon blinks blue when connected to mobile, and green when dealing with a merchant request
  const bluetoothColorClass = pendingRequest 
    ? 'text-green-400 blinking-green !shadow-none' 
    : (isMobileConnected ? 'text-blue-400 animate-pulse' : 'text-slate-700');

  return (
    <div className="relative flex flex-col items-center">
      {/* Watch Strap Top */}
      <div className="w-24 h-48 bg-slate-800 rounded-t-3xl border-x border-t border-slate-700 mb-[-60px] shadow-lg"></div>

      {/* Watch Case */}
      <div className="relative z-10 w-72 h-72 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-2">
        {/* Watch Face Screen */}
        <div 
          className="watch-face relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none"
        >
          
          {/* Top Status Area */}
          <div className="absolute top-4 flex flex-col items-center gap-0.5 z-20">
            <div className={`transition-colors duration-500 ${bluetoothColorClass}`}>
              <i className="fab fa-bluetooth-b text-base"></i>
            </div>
            <div className="text-[10px] font-bold text-slate-300 tracking-wider">
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
            <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-2 w-full mt-14">
              <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Request From</p>
              <h4 className="text-xs font-semibold truncate max-w-full mb-1">{pendingRequest.from}</h4>
              <div className="text-4xl font-black text-indigo-400 mb-2">₹{pendingRequest.amount}</div>
              <div className="flex gap-4 mt-2">
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
                {/* Brand Header */}
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <i className="fas fa-bolt text-white text-[10px]"></i>
                  </div>
                  <p className="text-[8px] text-indigo-400 font-black uppercase tracking-[0.25em]">ZiP WALLET</p>
                </div>

                <h3 className="text-4xl font-bold mb-0.5 tracking-tight">₹{userWallet.balance.toFixed(0)}</h3>
                <p className={`text-[10px] font-bold mb-4 ${userWallet.isActive ? 'text-indigo-400' : 'text-red-500'}`}>
                  {userWallet.isActive ? 'READY' : 'INACTIVE'}
                </p>
              </div>
              
              {/* Central Blinking Dot Button */}
              <button 
                onClick={onToggleActive}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 ${userWallet.isActive ? 'blinking-green bg-green-500' : 'blinking-red bg-red-500'}`}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </button>

              {/* Offline Transaction Counter - Shifted to the very bottom */}
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

          {/* Decorative Ring */}
          <div className="absolute inset-0 border border-slate-800/50 rounded-full pointer-events-none m-4"></div>
        </div>

        {/* Physical Crown */}
        <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-4 h-10 bg-slate-700 rounded-r-lg border-y border-r border-slate-600"></div>
      </div>

      {/* Watch Strap Bottom */}
      <div className="w-24 h-48 bg-slate-800 rounded-b-3xl border-x border-b border-slate-700 mt-[-60px] shadow-lg"></div>

      <style>{`
        @keyframes progress-watch {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-watch {
          animation: progress-watch 3.5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Smartwatch;