
import React, { useState } from 'react';
import { GlobalState } from '../types';

interface Props {
  wallet: GlobalState['merchantWallet'];
  onRequestPayment: (amount: number) => void;
  onToggleActive: () => void;
  onWithdraw: () => void;
}

const MerchantApp: React.FC<Props> = ({ wallet, onRequestPayment, onToggleActive, onWithdraw }) => {
  const [requestAmt, setRequestAmt] = useState<string>('');

  const handleKeypad = (val: string) => {
    if (val === 'C') return setRequestAmt('');
    if (requestAmt.length >= 4) return;
    setRequestAmt(prev => prev + val);
  };

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
      
      {/* Top Bar with Blinking Active Status */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleActive}
              className={`w-3 h-3 rounded-full ${wallet.isActive ? 'blinking-green bg-green-500' : 'blinking-red bg-red-500'}`}
            ></button>
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              {wallet.isActive ? 'TERMINAL ACTIVE' : 'TERMINAL INACTIVE'}
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">Merchant Hub</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase">Wallet Balance</p>
          <p className="text-lg font-bold text-green-400">₹{wallet.balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Input Display */}
      <div className="bg-slate-950 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
        <p className="text-xs text-slate-600 mb-1 uppercase font-bold tracking-widest">Request Amount</p>
        <div className="text-5xl font-mono text-indigo-400 font-bold">
          ₹{requestAmt || '0'}
        </div>
        <p className="text-[10px] text-slate-700 mt-2">Maximum transaction: ₹200</p>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'C'].map(key => (
          <button
            key={key}
            onClick={() => handleKeypad(key)}
            className="h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all rounded-xl font-bold text-lg flex items-center justify-center border border-slate-700/50"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Main Actions */}
      <div className="mt-auto space-y-3">
        <button 
          onClick={() => {
            const amt = Number(requestAmt);
            if (amt > 0) {
              onRequestPayment(amt);
              setRequestAmt('');
            }
          }}
          disabled={!wallet.isActive || !requestAmt}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${wallet.isActive && requestAmt ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
        >
          <i className="fas fa-hand-holding-usd"></i> Request Payment
        </button>

        <div className="flex gap-3">
          <button 
            onClick={onWithdraw}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <i className="fas fa-university"></i> Settle to Bank
          </button>
          <div className="flex-[0.6] bg-slate-950 rounded-xl px-4 flex flex-col justify-center border border-slate-800">
             <span className="text-[8px] text-slate-500 uppercase">Bank Ledger</span>
             <span className="text-xs font-bold text-slate-300 truncate">₹{wallet.bankBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default MerchantApp;
