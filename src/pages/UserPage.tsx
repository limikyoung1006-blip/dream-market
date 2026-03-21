import { useMarketStore } from '../store/useMarketStore';
import { QRGenerator } from '../components/QRGenerator';
import { History, CreditCard } from 'lucide-react';

export const UserPage = () => {
  const { currentUser, transactions } = useMarketStore();

  if (!currentUser) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  const userTransactions = transactions.filter(t => t.userId === currentUser.id);

  // 등급별 카드 색상 테마
  const cardTheme = {
    A: 'mesh-gradient-gold text-amber-950 shadow-amber-200/50',
    B: 'mesh-gradient-blue text-white shadow-blue-200/50',
    C: 'mesh-gradient-zinc text-white shadow-slate-200/50',
  }[currentUser.grade] || 'mesh-gradient-blue text-white shadow-blue-200/50';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Membership Card - Hidden for Admin */}
      {currentUser.role !== 'admin' && (
        <div className={`relative overflow-hidden rounded-[2rem] p-7 aspect-[1.586/1] flex flex-col justify-between shadow-2xl transition-all duration-500 hover:scale-[1.02] ${cardTheme}`}>
          <div className="relative z-10 flex flex-col h-full">
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h1 className="text-xl font-black italic tracking-tighter leading-none">DREAM MARKET</h1>
                <p className="text-[8px] font-black opacity-60 tracking-[0.2em] uppercase">Elite Membership</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black backdrop-blur-md border ${currentUser.grade === 'A' ? 'bg-white/40 border-amber-900/10' : 'bg-white/20 border-white/20'}`}>
                RANK {currentUser.grade}
              </div>
            </div>
            
            {/* IC Chip Visual */}
            <div className="mt-4 w-11 h-8 bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-500 rounded-md relative overflow-hidden shadow-inner flex-shrink-0">
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%)] bg-[length:4px_100%]" />
            </div>

            {/* Middle Section (Balance) - Centered in remaining space */}
            <div className="flex-grow flex flex-col justify-center py-2">
              <p className="text-[10px] font-bold opacity-60 tracking-wider uppercase leading-none mb-1">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black tracking-tight leading-none">{currentUser.points.toLocaleString()}</h2>
                <span className="text-lg font-bold">원</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-end border-t border-black/5 pt-3 mt-auto">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold opacity-40 uppercase leading-none">Card Holder</p>
                <p className="text-sm font-bold tracking-wide leading-none">{currentUser.name}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[9px] font-bold opacity-40 uppercase leading-none">Valid Thru</p>
                <p className="text-sm font-bold leading-none uppercase">Permanent</p>
              </div>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}

      {/* Admin View: Simple Balance View if no card */}
      {currentUser.role === 'admin' && (
        <div className="premium-card p-10 bg-slate-900 text-white border-none shadow-2xl flex flex-col items-center justify-center space-y-2">
          <p className="text-xs font-black text-white/40 uppercase tracking-widest">Admin Account Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black tracking-tight">{currentUser.points.toLocaleString()}</h2>
            <span className="text-xl font-bold opacity-60">원</span>
          </div>
        </div>
      )}

      {/* QR Section - Hidden for Admin */}
      {currentUser.role !== 'admin' && (
        <div className="premium-card p-8 flex flex-col items-center justify-center relative border-none shadow-xl bg-white overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          <h3 className="font-black text-slate-800 mb-6 tracking-tight text-center">PAYMENT AUTHENTICATION</h3>
          <div className="w-full max-w-[280px] bg-white rounded-[2rem] shadow-inner border border-slate-50 flex flex-col items-center justify-center p-4">
            <QRGenerator 
              value={currentUser.id} 
              label="매장 직원에게 스캔을 요청하세요" 
            />
          </div>
        </div>
      )}

      {/* Visit Summary Section (Simplified) */}
      <div className="w-full">
        <div className="premium-card p-8 bg-slate-900 border-none shadow-xl flex items-center justify-between text-white">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Visits</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{userTransactions.filter(t => t.type === 'use').length}</span>
              <span className="text-sm font-bold text-white/40">회</span>
            </div>
          </div>
          <p className="text-xs text-white/30 italic font-medium">항상 환영합니다 😊</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <History size={20} className="text-primary-600" />
            <h3 className="font-black text-slate-800 tracking-tight text-lg uppercase italic underline decoration-4 underline-offset-4 decoration-primary-100">History</h3>
          </div>
        </div>
        
        {userTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2">
            <p className="font-medium">거래 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userTransactions.map(t => (
              <div key={t.id} className="premium-card p-6 bg-white border border-slate-50 shadow-sm animate-in slide-in-from-bottom-4 group">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${t.type === 'use' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-600'}`}>
                      {t.type === 'use' ? <CreditCard size={18} /> : <History size={18} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">
                        {new Date(t.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </p>
                      <p className="font-black text-slate-800 tracking-tight">{t.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black tracking-tighter ${t.type === 'use' ? 'text-slate-900' : 'text-primary-600'}`}>
                      {t.type === 'use' ? '-' : '+'}{t.amount.toLocaleString()} <span className="text-[10px] font-bold">원</span>
                    </p>
                  </div>
                </div>

                {/* Items Breakdown (If available) */}
                {t.items && t.items.length > 0 && (
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl">
                    {t.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString()} 원</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
