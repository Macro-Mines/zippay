
import React, { useState, useEffect } from 'react';
import { GlobalState, NotificationType } from '../types';
import NotificationOverlay from './NotificationOverlay';

interface Props {
  userWallet: GlobalState['userWallet'];
  connectivity: GlobalState['connectivity'];
  phoneAlert: { message: string; type: NotificationType } | null;
  onLoadMoney: (amount: number) => void;
  onSync: () => void;
  onToggleConnectivity: (type: 'bluetooth' | 'wifi', value: boolean) => void;
  onCloseAlert: () => void;
}

const SmartphoneUPI: React.FC<Props> = ({ 
  userWallet, 
  connectivity, 
  phoneAlert,
  onLoadMoney, 
  onSync, 
  onToggleConnectivity,
  onCloseAlert
}) => {
  const [amount, setAmount] = useState<string>('');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (showFullHistory) {
    return (
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 mb-40 shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-right duration-300 h-[700px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
        <div className="mt-8 flex items-center gap-4 mb-8">
           <button onClick={() => setShowFullHistory(false)} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
             <i className="fas fa-chevron-left text-slate-300"></i>
           </button>
           <h2 className="text-xl font-bold">Transaction History</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
          {userWallet.transactions.length === 0 ? (
            <div className="text-center py-20 text-slate-500">No records found</div>
          ) : (
            userWallet.transactions.map(tx => (
              <div key={tx.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    <i className={`fas ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.peer}</p>
                    <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <p className={`font-bold text-base ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-slate-100'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-center pb-8">
          <div className="w-24 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  const isWatchLinked = connectivity.isBluetoothOn && userWallet.isActive;
  const isLoadReady = connectivity.isWifiOn && isWatchLinked;

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 mb-40 shadow-2xl relative overflow-hidden flex flex-col h-[700px]">
      {/* Phone Notch & Status Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
      <div className="absolute top-0 left-0 right-0 h-12 px-8 flex justify-between items-center text-[10px] font-bold text-slate-400 z-10">
        <span className="mt-2">{time}</span>
        <div className="flex gap-3 items-center mt-2">
          <button 
            onClick={() => onToggleConnectivity('bluetooth', !connectivity.isBluetoothOn)}
            className={`transition-colors p-1 ${connectivity.isBluetoothOn ? 'text-indigo-400' : 'text-slate-700'}`}
            title="Toggle Bluetooth"
          >
            <i className="fab fa-bluetooth-b text-sm"></i>
          </button>
          <button 
            onClick={() => onToggleConnectivity('wifi', !connectivity.isWifiOn)}
            className={`transition-colors p-1 ${connectivity.isWifiOn ? 'text-indigo-400' : 'text-slate-700'}`}
            title="Toggle Wi-Fi"
          >
            <i className="fas fa-wifi text-xs"></i>
          </button>
          <i className="fas fa-battery-three-quarters text-slate-500"></i>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-8 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <i className="fas fa-bolt text-indigo-500 text-[10px]"></i>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">ZiPPaY UPI</p>
            </div>
            <h2 className="text-2xl font-bold">Hello, User</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-lg shadow-black/20">
            <i className="fas fa-user-circle text-indigo-400 text-xl"></i>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl"></div>
          
          <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 opacity-80">Watch Wallet Balance</p>
          <h3 className="text-4xl font-black tracking-tight">₹{userWallet.balance.toFixed(2)}</h3>
          
          <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-end">
            <div>
              <p className="text-indigo-200 text-[9px] uppercase font-bold tracking-wider mb-0.5">Primary Bank</p>
              <p className="text-sm font-semibold">₹{userWallet.phoneBalance.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-[9px] uppercase font-bold tracking-wider mb-0.5">Watch Pro 2</p>
              <div className="flex items-center justify-end gap-2">
                <div className={`w-2 h-2 rounded-full ${isWatchLinked ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] blinking-green' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold">{isWatchLinked ? 'CONNECTED' : 'OFFLINE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Reload Micro-Wallet</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl pl-8 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-800 transition-all text-xl font-bold placeholder:text-slate-600"
              />
            </div>
            {!isLoadReady && (
               <p className="text-[8px] text-red-400 font-bold uppercase tracking-tight text-center">
                 { !connectivity.isWifiOn ? 'Wi-Fi required for bank connection' : 
                   !userWallet.isActive ? 'Activate Watch to Load' :
                   !connectivity.isBluetoothOn ? 'Connect Watch via Bluetooth' : '' }
               </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                onLoadMoney(Number(amount));
                setAmount('');
              }}
              className={`group relative overflow-hidden h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isLoadReady ? 'bg-white text-indigo-950 hover:bg-indigo-50' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
            >
              <i className={`fas fa-plus-circle ${isLoadReady ? 'text-indigo-600' : ''}`}></i>
              Load Watch
            </button>
            <button 
              onClick={onSync}
              className={`h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 border ${isWatchLinked ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'}`}
            >
              <i className={`fas fa-sync-alt ${isWatchLinked ? 'animate-spin-slow' : ''}`}></i>
              Sync
            </button>
          </div>
        </div>

        {/* Mini History Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">History</h4>
            <button 
              onClick={() => setShowFullHistory(true)}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {userWallet.transactions.length === 0 ? (
              <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                No recent activity
              </div>
            ) : (
              userWallet.transactions.slice(0, 2).map(tx => (
                <div key={tx.id} className="bg-slate-800/40 p-4 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-300'}`}>
                      <i className={`fas ${tx.type === 'CREDIT' ? 'fa-plus' : 'fa-shopping-bag'}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{tx.peer}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-slate-100'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="mt-6 flex justify-center pb-8 shrink-0">
        <div className="w-24 h-1.5 bg-slate-800 rounded-full"></div>
      </div>

      {/* Local App Notification */}
      {phoneAlert && (
        <NotificationOverlay 
          message={phoneAlert.message} 
          type={phoneAlert.type} 
          duration={3500} 
          onClose={onCloseAlert} 
        />
      )}

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartphoneUPI;
