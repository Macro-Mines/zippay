
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, GlobalState, Transaction, NotificationType } from './types';
import SmartphoneUPI from './components/SmartphoneUPI';
import Smartwatch from './components/Smartwatch';
import MerchantApp from './components/MerchantApp';
import { sounds } from './utils/audio';
import { haptics } from './utils/haptics';

const STORAGE_KEY = 'flashpay_prototype_state';

const initialState: GlobalState = {
  userWallet: {
    balance: 0,
    phoneBalance: 10000,
    transactions: [],
    pendingSync: [],
    offlineCount: 0,
    isActive: true,
    isAutoReloadEnabled: false,
  },
  merchantWallet: {
    balance: 0,
    bankBalance: 0,
    transactions: [],
    isActive: true,
  },
  pendingPaymentRequest: null,
  connectivity: {
    isBluetoothOn: false,
    isWifiOn: false,
  }
};

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.UPI);
  const [watchAlert, setWatchAlert] = useState<{ message: string; type: NotificationType } | null>(null);
  const [phoneAlert, setPhoneAlert] = useState<{ message: string; type: NotificationType } | null>(null);
  const [state, setState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.userWallet && parsed.userWallet.isAutoReloadEnabled === undefined) {
        parsed.userWallet.isAutoReloadEnabled = false;
      }
      return parsed;
    }
    return initialState;
  });

  const autoReloadTriggered = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const triggerWatchAlert = useCallback((message: string, type: NotificationType = 'error') => {
    setWatchAlert({ message, type });
    if (type === 'success') {
      sounds.playSuccess();
      haptics.successPulse();
    } else if (type === 'error') {
      sounds.playError();
      haptics.errorPulse();
    }
    setTimeout(() => setWatchAlert(null), 3500);
  }, []);

  const triggerPhoneAlert = useCallback((message: string, type: NotificationType = 'success') => {
    setPhoneAlert({ message, type });
    if (type === 'success') {
      sounds.playSuccess();
      haptics.successPulse();
    } else if (type === 'error') {
      sounds.playError();
      haptics.errorPulse();
    }
  }, []);

  const toggleAutoReload = (enabled: boolean) => {
    setState(prev => ({
      ...prev,
      userWallet: { ...prev.userWallet, isAutoReloadEnabled: enabled }
    }));
    sounds.playPop();
    haptics.lightClick();
    triggerPhoneAlert(enabled ? "Auto-Reload enabled (₹50 → ₹200)" : "Auto-Reload disabled", 'info');
  };

  useEffect(() => {
    const { userWallet, connectivity } = state;
    const isWatchLinked = connectivity.isBluetoothOn && userWallet.isActive;
    const isLoadReady = connectivity.isWifiOn && isWatchLinked;

    if (userWallet.isAutoReloadEnabled && isLoadReady && userWallet.balance < 50 && !autoReloadTriggered.current) {
      autoReloadTriggered.current = true;
      
      // Auto-reload only if balance is at least negative-clearing or zero
      // If balance is -104, reloadAmount is 200 - (-104) = 304
      const reloadAmount = 200 - userWallet.balance;
      
      if (userWallet.phoneBalance >= reloadAmount) {
        setTimeout(() => {
          const txId = `TXN-AUTO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          const tx: Transaction = {
            id: txId,
            amount: reloadAmount,
            timestamp: Date.now(),
            type: 'CREDIT',
            peer: 'Auto-Reload (Bank)',
          };

          setState(prev => ({
            ...prev,
            userWallet: {
              ...prev.userWallet,
              balance: prev.userWallet.balance + reloadAmount,
              phoneBalance: prev.userWallet.phoneBalance - reloadAmount,
              transactions: [tx, ...prev.userWallet.transactions],
            }
          }));
          
          triggerWatchAlert(`+₹${reloadAmount.toFixed(0)} AUTO-LOADED`, 'success');
          triggerPhoneAlert(`Auto-Reload triggered: ₹${reloadAmount.toFixed(0)} added to ZiP WALLET`, 'success');
          autoReloadTriggered.current = false;
        }, 1000);
      } else {
        triggerPhoneAlert("Auto-Reload failed: Insufficient bank balance", 'error');
        autoReloadTriggered.current = false;
      }
    }
  }, [state.userWallet.balance, state.userWallet.isActive, state.connectivity, state.userWallet.isAutoReloadEnabled, triggerWatchAlert, triggerPhoneAlert]);

  const toggleUserActive = () => {
    const newState = !state.userWallet.isActive;
    setState(prev => ({
      ...prev,
      userWallet: { ...prev.userWallet, isActive: newState }
    }));
    sounds.playPop();
    haptics.mediumClick();
    triggerWatchAlert(newState ? 'WATCH ACTIVE' : 'WATCH INACTIVE', newState ? 'success' : 'error');
  };

  const toggleMerchantActive = () => {
    sounds.playPop();
    haptics.mediumClick();
    setState(prev => ({
      ...prev,
      merchantWallet: { ...prev.merchantWallet, isActive: !prev.merchantWallet.isActive }
    }));
  };

  const setConnectivity = (type: 'bluetooth' | 'wifi', value: boolean) => {
    sounds.playPing();
    haptics.lightClick();
    setState(prev => ({
      ...prev,
      connectivity: {
        ...prev.connectivity,
        [type === 'bluetooth' ? 'isBluetoothOn' : 'isWifiOn']: value
      }
    }));
  };

  const loadWatchWallet = (amount: number) => {
    if (!state.userWallet.isActive) {
      triggerPhoneAlert("Watch is inactive. Please activate it first.", 'error');
      return triggerWatchAlert("WATCH INACTIVE", 'error');
    }

    if (!state.connectivity.isWifiOn || !state.connectivity.isBluetoothOn) {
      triggerPhoneAlert("Check connectivity. Bluetooth and Wi-Fi are required.", 'error');
      return triggerWatchAlert("SYNC ERROR", 'error');
    }
    
    if (amount <= 0 || amount > 500) return;
    
    if (state.userWallet.balance + amount > 500) {
      triggerPhoneAlert("Maximum wallet limit of ₹500 reached.", 'error');
      return triggerWatchAlert("LIMIT REACHED", 'error');
    }
    
    if (state.userWallet.phoneBalance < amount) {
      triggerPhoneAlert("Insufficient bank balance for this load.", 'error');
      return triggerWatchAlert("LOW BANK BAL", 'error');
    }

    const txId = `TXN-LOAD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const tx: Transaction = {
      id: txId,
      amount: amount,
      timestamp: Date.now(),
      type: 'CREDIT',
      peer: 'Primary Bank',
    };

    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        balance: prev.userWallet.balance + amount,
        phoneBalance: prev.userWallet.phoneBalance - amount,
        transactions: [tx, ...prev.userWallet.transactions],
      }
    }));
    
    triggerWatchAlert(`+₹${amount} LOADED`, 'success');
    triggerPhoneAlert(`Successfully loaded ₹${amount} into your ZiP WALLET`, 'success');
  };

  const requestPayment = (amount: number) => {
    if (!state.merchantWallet.isActive) return;
    if (!state.userWallet.isActive) {
      return triggerWatchAlert("WATCH INACTIVE", 'error');
    }
    if (amount > 200) {
      triggerPhoneAlert("Transaction exceeds micro-payment limit of ₹200", 'error');
      return;
    }
    
    setState(prev => ({
      ...prev,
      pendingPaymentRequest: {
        from: "Local Merchant",
        amount,
        timestamp: Date.now()
      }
    }));
    sounds.playPing(); 
    haptics.mediumClick();
    setActiveMode(AppMode.WATCH);
  };

  const processPayment = (approve: boolean) => {
    if (!approve) {
      setState(prev => ({ ...prev, pendingPaymentRequest: null }));
      triggerWatchAlert("PAYMENT CANCEL", 'error');
      return;
    }

    const request = state.pendingPaymentRequest;
    if (!request) return;

    if (!state.userWallet.isActive) {
      return triggerWatchAlert("WATCH INACTIVE", 'error');
    }
    
    let isEmergency = false;
    let finalDebitAmount = request.amount;

    if (state.userWallet.balance < request.amount) {
      // Check if eligible for Emergency ZiP (balance must be >= 0)
      if (state.userWallet.balance >= 0) {
        isEmergency = true;
        const fee = request.amount * 0.04;
        finalDebitAmount = request.amount + fee;
      } else {
        return triggerWatchAlert("DEBT PENDING", 'error');
      }
    }
    
    if (state.userWallet.offlineCount >= 5) {
      return triggerWatchAlert("SYNC REQUIRED", 'error');
    }

    const txId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const tx: Transaction = {
      id: txId,
      amount: finalDebitAmount,
      timestamp: Date.now(),
      type: 'DEBIT',
      peer: isEmergency ? `${request.from} (Emergency)` : request.from,
    };

    const merchantTx: Transaction = {
      ...tx,
      amount: request.amount, // Merchant only gets requested amount
      type: 'CREDIT',
      peer: 'ZiPPaY User'
    };

    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        balance: prev.userWallet.balance - finalDebitAmount,
        pendingSync: [tx, ...prev.userWallet.pendingSync],
        offlineCount: prev.userWallet.offlineCount + 1,
      },
      merchantWallet: {
        ...prev.merchantWallet,
        balance: prev.merchantWallet.balance + request.amount,
        transactions: [merchantTx, ...prev.merchantWallet.transactions],
      },
      pendingPaymentRequest: null
    }));
    
    triggerWatchAlert(isEmergency ? "EMERGENCY PAID" : "PAID SUCCESS", 'success');
  };

  const syncWatch = () => {
    if (!state.connectivity.isBluetoothOn) {
      triggerPhoneAlert("Bluetooth connection required to sync history.", 'error');
      return triggerWatchAlert("SYNC FAILED", 'error');
    }
    
    setState(prev => ({
      ...prev,
      userWallet: {
        ...prev.userWallet,
        transactions: [...prev.userWallet.pendingSync, ...prev.userWallet.transactions],
        pendingSync: [],
        offlineCount: 0,
      }
    }));
    triggerWatchAlert("SYNC COMPLETE", 'success');
    triggerPhoneAlert("Transaction history synced from watch successfully.", 'success');
  };

  const withdrawMerchant = () => {
    const amount = state.merchantWallet.balance;
    if (amount <= 0) return;
    
    setState(prev => ({
      ...prev,
      merchantWallet: {
        ...prev.merchantWallet,
        balance: 0,
        bankBalance: prev.merchantWallet.bankBalance + amount,
      }
    }));
    triggerPhoneAlert(`Settlement of ₹${amount} completed to your bank account.`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ZiP<span className="text-indigo-400">PaY</span></h1>
        </div>
        
        <nav className="flex gap-2 bg-slate-900 p-1 rounded-xl">
          <button onClick={() => { setActiveMode(AppMode.UPI); sounds.playPop(); haptics.lightClick(); }} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.UPI ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-mobile-alt mr-2"></i> UPI App
          </button>
          <button onClick={() => { setActiveMode(AppMode.WATCH); sounds.playPop(); haptics.lightClick(); }} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.WATCH ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-clock mr-2"></i> Watch
          </button>
          <button onClick={() => { setActiveMode(AppMode.MERCHANT); sounds.playPop(); haptics.lightClick(); }} className={`px-4 py-2 rounded-lg transition-all ${activeMode === AppMode.MERCHANT ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-store mr-2"></i> Merchant
          </button>
        </nav>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
        {activeMode === AppMode.UPI && (
          <SmartphoneUPI 
            userWallet={state.userWallet} 
            connectivity={state.connectivity}
            phoneAlert={phoneAlert}
            onLoadMoney={loadWatchWallet} 
            onSync={syncWatch}
            onToggleConnectivity={setConnectivity}
            onToggleAutoReload={toggleAutoReload}
            onCloseAlert={() => setPhoneAlert(null)}
          />
        )}
        
        {activeMode === AppMode.WATCH && (
          <Smartwatch 
            userWallet={state.userWallet} 
            pendingRequest={state.pendingPaymentRequest}
            isMobileConnected={state.connectivity.isBluetoothOn}
            watchAlert={watchAlert}
            onToggleActive={toggleUserActive}
            onProcessPayment={processPayment}
          />
        )}

        {activeMode === AppMode.MERCHANT && (
          <MerchantApp 
            wallet={state.merchantWallet}
            phoneAlert={phoneAlert}
            onRequestPayment={requestPayment}
            onToggleActive={toggleMerchantActive}
            onWithdraw={withdrawMerchant}
            onCloseAlert={() => setPhoneAlert(null)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
