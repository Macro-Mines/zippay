
import React, { useState, useEffect } from 'react';
import { GlobalState, NotificationType } from '../types';
import NotificationOverlay from './NotificationOverlay';
import { haptics } from '../utils/haptics';

interface Props {
  userWallet: GlobalState['userWallet'];
  connectivity: GlobalState['connectivity'];
  phoneAlert: { message: string; type: NotificationType } | null;
  onLoadMoney: (amount: number) => void;
  onSync: () => void;
  onToggleConnectivity: (type: 'bluetooth' | 'wifi', value: boolean) => void;
  onToggleAutoReload: (enabled: boolean) => void;
  onCloseAlert: () => void;
}

const SmartphoneUPI: React.FC<Props> = ({ 
  userWallet, 
  connectivity, 
  phoneAlert,
  onLoadMoney, 
  onSync, 
  onToggleConnectivity,
  onToggleAutoReload,
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

  const isWatchLinked = connectivity.isBluetoothOn && userWallet.isActive;
  const isLoadReady = connectivity.isWifiOn && isWatchLinked;

  const frameClasses = "w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-8 mb-40 shadow-2xl relative overflow-hidden flex flex-col h-[700px]";

  if (showFullHistory) {
    return (
      <div className={`${frameClasses} animate-in slide-in-from-right duration-300`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
        
        <div className="mt-8 flex items-center gap-4 mb-8">
           <button onClick={() => { haptics.lightClick(); setShowFullHistory(false); }} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
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

        <div className="mt-2 flex justify-center pb-2">
          <div className="w-24 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={frameClasses}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20"></div>
      <div className="absolute top-0 left-0 right-0 h-12 px-8 flex justify-between items-center text-[10px] font-bold text-slate-400 z-10">
        <span className="mt-2">{time}</span>
        <div className="flex gap-3 items-center mt-2">
          <button 
            onClick={() => onToggleConnectivity('bluetooth', !connectivity.isBluetoothOn)}
            className={`transition-colors ${connectivity.isBluetoothOn ? 'text-blue-400' : 'text-slate-600'}`}
          >
            <i className="fab fa-bluetooth-b"></i>
          </button>
          <button 
            onClick={() => onToggleConnectivity('wifi', !connectivity.isWifiOn)}
            className={`transition-colors ${connectivity.isWifiOn ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            <i className="fas fa-wifi"></i>
          </button>
          <i className="fas fa-battery-three-quarters"></i>
        </div>
      </div>

      <div className="mt-8 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-black">Hi, User</h2>
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
          <i className="fas fa-user text-slate-500"></i>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-6 mb-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">ZiP BALANCE</p>
              <h3 className={`text-4xl font-black ${userWallet.balance < 0 ? 'text-red-400' : 'text-white'}`}>₹{userWallet.balance.toFixed(2)}</h3>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-bolt text-white text-xs animate-pulse"></i>
            </div>
          </div>
          
          <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
            <div>
              <p className="text-[9px] font-bold text-indigo-200 uppercase mb-1">PRIMARY BANK</p>
              <p className="text-sm font-bold text-white">₹{userWallet.phoneBalance.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-indigo-200 uppercase mb-1">WATCH CONNECTION</p>
              <p className={`text-[10px] font-black flex items-center gap-1.5 ${isWatchLinked ? 'text-green-300' : 'text-indigo-300 opacity-60'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isWatchLinked ? 'bg-green-400 animate-pulse' : 'bg-indigo-400'}`}></span>
                {isWatchLinked ? 'CONNECTED' : 'DISCONNECTED'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-2xl p-4 mb-6 border border-slate-800/50 flex items-center justify-between transition-all">
        <div>
          <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Auto-Reload</h4>
          <p className="text-[8px] text-slate-500 font-medium">Reload to ₹200 if balance drops &lt; ₹50</p>
        </div>
        <button 
          onClick={() => { haptics.lightClick(); onToggleAutoReload(!userWallet.isAutoReloadEnabled); }}
          className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${userWallet.isAutoReloadEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${userWallet.isAutoReloadEnabled ? 'left-6' : 'left-1'}`}></div>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3 px-1">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOP-UP WALLET</h4>
          <span className="text-[8px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">MICRO-PAY READY</span>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-800"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                haptics.mediumClick();
                onLoadMoney(Number(amount));
                setAmount('');
              }}
              disabled={!isLoadReady || !amount}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${isLoadReady && amount ? 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              <i className="fas fa-plus-circle"></i> Load
            </button>
            <button 
              onClick={() => { haptics.mediumClick(); onSync(); }}
              disabled={!connectivity.isBluetoothOn}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${connectivity.isBluetoothOn ? 'bg-slate-800 text-indigo-400 border border-indigo-500/10 hover:border-indigo-500/40 active:scale-95' : 'bg-slate-900/50 text-slate-700 border border-slate-800 cursor-not-allowed'}`}
            >
              <i className="fas fa-sync-alt"></i> Sync
            </button>
          </div>
        </div>
        {!isLoadReady && (
          <p className="text-[9px] text-red-500/70 mt-3 ml-1 font-medium">
            {!connectivity.isWifiOn ? '• Turn on Wi-Fi' : !isWatchLinked ? '• Connect watch via Bluetooth' : ''}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 px-1">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h4>
          <button 
            onClick={() => { haptics.lightClick(); setShowFullHistory(true); }} 
            className="text-[10px] font-bold text-indigo-400 uppercase hover:underline"
          >
            See All
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar pb-6">
          {userWallet.transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="bg-slate-800/30 p-3 rounded-2xl flex items-center justify-between border border-slate-800/50 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                  <i className={`fas ${tx.type === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                </div>
                <div>
                  <p className="text-xs font-bold truncate max-w-[120px]">{tx.peer}</p>
                  <p className="text-[8px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <p className={`text-xs font-black ${tx.type === 'CREDIT' ? 'text-green-400' : (tx.peer.includes('Emergency') ? 'text-red-400' : 'text-slate-200')}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
              </p>
            </div>
          ))}
          {userWallet.transactions.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-[10px] text-slate-600 font-bold uppercase">No Transactions</p>
            </div>
          )}
        </div>
      </div>

      {phoneAlert && (
        <NotificationOverlay 
          message={phoneAlert.message} 
          type={phoneAlert.type} 
          duration={3500} 
          onClose={onCloseAlert} 
        />
      )}

      <div className="mt-2 flex justify-center pb-2">
        <div className="w-24 h-1 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};

export default SmartphoneUPI;
