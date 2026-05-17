import { useState, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { QRScanner } from '../components/QRScanner';
import { Scan, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBasket, Plus, Minus, Trash2, Package } from 'lucide-react';

export const StorePage = () => {
  const { updatePoints, users, products } = useMarketStore();
  const [step, setStep] = useState<'products' | 'scanning' | 'result'>('products');
  const isProcessingRef = useRef(false);
  const [basket, setBasket] = useState<{ productId: string; name: string; quantity: number; price: number }[]>([]);
  const [result, setResult] = useState<{ 
    success: boolean; 
    message: string; 
    buyerName?: string; 
    purchasedItems?: typeof basket;
    total?: number;
    remainingPoints?: number;
  } | null>(null);

  const totalAmount = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const addToBasket = (p: typeof products[0]) => {
    setBasket(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) return prev;
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (p.stock <= 0) return prev;
      return [...prev, { productId: p.id, name: p.name, quantity: 1, price: p.price }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setBasket(prev => prev.map(item => {
      if (item.productId === id) {
        const product = products.find(p => p.id === id);
        const maxQty = product ? product.stock : 1;
        const newQty = Math.min(maxQty, Math.max(1, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromBasket = (id: string) => {
    setBasket(prev => prev.filter(item => item.productId !== id));
  };

  const handleScanSuccess = async (userId: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        alert('등록되지 않은 회원입니다.');
        setResult({ success: false, message: '등록되지 않은 회원입니다.' });
        setStep('result');
        return;
      }

      for (const item of basket) {
        const p = products.find(p => p.id === item.productId);
        if (!p || p.stock < item.quantity) {
          await updatePoints(
            userId, 
            0, 
            'use', 
            `[결제 실패 - 재고 부족] ${item.name} (현재 재고: ${p?.stock || 0}개)`,
            undefined,
            0
          );
          alert(`재고가 부족합니다: ${item.name} (현재 재고: ${p?.stock || 0}개)`);
          setResult({ success: false, message: `재고가 부족합니다: ${item.name} (현재 재고: ${p?.stock || 0}개)` });
          setStep('result');
          return;
        }
      }

      if (user.points < totalAmount) {
        await updatePoints(
          userId, 
          0, 
          'use', 
          `[결제 실패 - 잔액 부족] ${basket[0].name}${basket.length > 1 ? ` 외 ${basket.length - 1}건` : ''} (시도금액: ${totalAmount.toLocaleString()}원)`,
          undefined,
          0
        );
        alert(`잔액이 부족합니다. (현재: ${user.points.toLocaleString()} 원, 필요: ${totalAmount.toLocaleString()} 원)`);
        setResult({ success: false, message: `잔액이 부족합니다. (현재: ${user.points.toLocaleString()} 원, 필요: ${totalAmount.toLocaleString()} 원)` });
        setStep('result');
        return;
      }

      const transactionItems = basket.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const totalBenefit = basket.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        const marketPrice = product?.marketPrice || item.price;
        const benefit = Math.max(0, marketPrice - item.price);
        return sum + (benefit * item.quantity);
      }, 0);

      const success = await updatePoints(
        userId, 
        totalAmount, 
        'use', 
        `${basket[0].name}${basket.length > 1 ? ` 외 ${basket.length - 1}건` : ''}`,
        transactionItems,
        totalBenefit
      );
      
      if (success) {
        const itemsSummary = basket.length === 1
          ? `${basket[0].name} ${basket[0].quantity}개가`
          : `${basket[0].name} ${basket[0].quantity}개 외 ${basket.length - 1}건이`;

        alert(`${itemsSummary} 구매되었습니다.`);
        setResult({ 
          success: true, 
          message: `${itemsSummary} 구매되었습니다.`,
          buyerName: user.name,
          purchasedItems: basket,
          total: totalAmount,
          remainingPoints: user.points - totalAmount
        });
      } else {
        alert('결제 중 오류가 발생했습니다.');
        setResult({ success: false, message: '결제 중 오류가 발생했습니다.' });
      }
      setStep('result');
    } catch (error) {
      console.error(error);
      alert('결제 처리 중 시스템 오류가 발생했습니다.');
      setResult({ success: false, message: '결제 처리 중 시스템 오류가 발생했습니다.' });
      setStep('result');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const reset = () => {
    setStep('products');
    setBasket([]);
    setResult(null);
  };

  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {step === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBasket className="text-primary-600" /> 상품 선택
            </h2>
            <span className="text-xs text-slate-400">담긴 상품: {basket.length}개</span>
          </div>

          {/* Product List */}
          <div className={`grid grid-cols-1 gap-4 ${basket.length > 0 ? 'pb-52' : 'pb-8'}`}>
            {products.map(p => (
              <button 
                key={p.id} 
                onClick={() => addToBasket(p)}
                disabled={p.stock <= 0}
                className="premium-card p-5 md:p-6 flex items-center justify-between text-left group hover:border-primary-400 transition-all disabled:opacity-50 bg-slate-900 border-none shadow-2xl relative overflow-hidden active:scale-95 gap-4"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/50" />
                <div className="flex flex-1 items-center gap-4 md:gap-8 min-w-0 pr-2">
                  <div className="flex-1">
                    <p className="font-black text-white text-lg md:text-xl tracking-tight leading-tight break-all">{p.name}</p>
                    <div className={`inline-flex items-center gap-1 mt-1 text-[8px] md:text-[9px] font-black uppercase tracking-wider ${p.stock < 10 ? 'text-red-400' : 'text-slate-500'}`}>
                      <Package size={10} /> 재고 {p.stock}개
                    </div>
                  </div>
                  
                  <div className="flex items-center shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">Price</span>
                      <span className="text-primary-400 font-black text-lg md:text-xl leading-none whitespace-nowrap">{p.price.toLocaleString()} 원</span>
                    </div>
                  </div>
                </div>

                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-inner shrink-0">
                  <Plus size={24} />
                </div>
              </button>
            ))}
          </div>

          {basket.length > 0 && (
            <div className="fixed bottom-24 left-6 right-6 z-40 animate-in slide-in-from-bottom-10">
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl space-y-4 border-2 border-sky-400/50">
                <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {basket.map(item => (
                    <div key={item.productId} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-grow mr-4">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-primary-400"><Minus size={14}/></button>
                          <span className="w-4 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-primary-400"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeFromBasket(item.productId)} className="text-white/40 hover:text-red-400"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-black">Total to PAY</p>
                    <p className="text-2xl font-black">{totalAmount.toLocaleString()} 원</p>
                  </div>
                  <button 
                    onClick={() => setStep('scanning')}
                    className="bg-primary-600 hover:bg-primary-500 px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2"
                  >
                    <Scan size={18} /> 결제하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'scanning' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setStep('products')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold">QR 코드 스캔</h2>
              <p className="text-xs text-slate-500">결제 금액: {totalAmount.toLocaleString()} 원</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
          <p className="text-center text-slate-400 text-sm">고객의 QR코드를 카메라에 맞춰주세요.</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-300">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 shadow-2xl ${result.success ? 'bg-green-100 text-green-600 shadow-green-100' : 'bg-red-100 text-red-600 shadow-red-100'}`}>
            {result.success ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {result.success ? '결제 성공' : '결제 실패'}
          </h2>
          <p className="text-slate-500 mb-6">{result.message}</p>
          
          {result.success && result.purchasedItems && (
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-8 text-left space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer (이용자)</p>
                  <p className="text-lg font-bold text-slate-800">{result.buyerName} 님</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {result.purchasedItems.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">{item.name} <span className="text-slate-400 text-xs ml-1">x{item.quantity}</span></span>
                    <span className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">총 결제 금액</span>
                  <span className="text-xl font-black text-primary-600">{result.total?.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">결제 후 잔여 포인트</span>
                  <span className="text-sm font-black text-slate-600">{result.remainingPoints?.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={reset}
            className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl"
          >
            확인 및 새로운 결제
          </button>
        </div>
      )}
    </div>
  );
};
