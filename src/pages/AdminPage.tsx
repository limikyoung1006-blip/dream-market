import { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Users, Coins, Plus, Search, Package, X, Save, Download, FileText, Edit2, Minus, Trash2, ShieldCheck } from 'lucide-react';

export const AdminPage = () => {
  const { users, products, addUser, updateUser, deleteUser, addProduct, updateStock, updatePoints, transactions, currentUser } = useMarketStore();
  const isSuperAdmin = currentUser?.name === '백동희';
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'admins' | 'inventory' | 'reports'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(0);
  const [chargeDescription, setChargeDescription] = useState('관리자 충전');
  const [chargingTarget, setChargingTarget] = useState<'individual' | 'selected'>('individual');
  const [individualTargetId, setIndividualTargetId] = useState<string | null>(null);

  // New User State
  const [newUser, setNewUser] = useState({
    name: '',
    birthdate: '',
    phone: '',
    phoneMain: '', // Stores the 8 digits after 010
    password: '',
    address: '',
    role: 'user' as 'user' | 'admin',
    grade: '기타'
  });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    stock: 0
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `010${newUser.phoneMain}`;
    if (editingUser) {
      updateUser(editingUser.id, { ...newUser, phone: fullPhone });
      setEditingUser(null);
    } else {
      const id = `${newUser.role}-${Date.now()}`;
      addUser({ ...newUser, id, phone: fullPhone, points: 0 });
    }
    setIsUserModalOpen(false);
    setNewUser({ name: '', birthdate: '', phone: '', phoneMain: '', password: '', role: 'user', grade: '기타', address: '' });
  };

  const openEditModal = (user: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking edit
    setEditingUser(user);
    setNewUser({
      name: user.name,
      birthdate: user.birthdate,
      phone: user.phone,
      phoneMain: user.phone.startsWith('010') ? user.phone.slice(3) : user.phone,
      password: user.password,
      address: user.address || '',
      role: user.role,
      grade: user.grade
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말로 이 회원을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) {
      deleteUser(userId);
      setExpandedUserId(null);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const { updateProduct } = useMarketStore.getState();
      updateProduct(editingProduct.id, newProduct);
      setEditingProduct(null);
    } else {
      const id = `p-${Date.now()}`;
      addProduct({ ...newProduct, id, marketPrice: 0 });
    }
    setIsProductModalOpen(false);
    setNewProduct({ name: '', price: 0, stock: 0 });
  };

  const openProductEditModal = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    setIsProductModalOpen(true);
  };

  const exportToCSV = (type: 'inventory' | 'accounting') => {
    let headers = "";
    let rows = "";
    let filename = "";

    if (type === 'inventory') {
      headers = "상품ID,상품명,판매가,현재재고\n";
      rows = products.map(p => `${p.id},${p.name},${p.price},${p.stock}`).join("\n");
      filename = `dream_market_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = "거래ID,사용자ID,구분,금액,일시,내용\n";
      rows = transactions.map(t => `${t.id},${t.userId},${t.type},${t.amount},${new Date(t.timestamp).toLocaleString()},${t.description}`).join("\n");
      filename = `dream_market_accounting_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.includes(searchTerm) || u.id.includes(searchTerm);
    if (!matchesSearch) return false;
    return u.role === 'user';
  });

  const filteredAdmins = users.filter(u => {
    const matchesSearch = u.name.includes(searchTerm) || u.id.includes(searchTerm);
    if (!matchesSearch) return false;
    return u.role === 'admin';
  });

  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm)
  );

  const handleBulkCharge = () => {
    if (confirm('모든 일반 회원에게 월간 포인트를 지급하시겠습니까?')) {
      users.filter(u => u.role === 'user').forEach(u => {
        const amount = u.grade === '미혼모' ? 100000 : u.grade === '차상위' ? 50000 : 30000;
        updatePoints(u.id, amount, 'charge', '월간 정기 정산');
      });
      alert('일괄 충전이 완료되었습니다.');
    }
  };

  const handleSelectedCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (chargingTarget === 'individual' && individualTargetId) {
      updatePoints(individualTargetId, chargeAmount, 'charge', chargeDescription);
    } else if (chargingTarget === 'selected') {
      selectedUsers.forEach(id => {
        updatePoints(id, chargeAmount, 'charge', chargeDescription);
      });
      setSelectedUsers([]);
    }
    setIsChargeModalOpen(false);
    setChargeAmount(0);
    setChargeDescription('관리자 충전');
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {[
          { id: 'members', icon: Users, label: '이용자 관리' },
          ...(isSuperAdmin ? [{ id: 'admins', icon: ShieldCheck, label: '관리자 관리' }] : []),
          { id: 'inventory', icon: Package, label: '재고 관리' },
          { id: 'reports', icon: FileText, label: '보고서/회계' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeSubTab === tab.id ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon size={16} />
            <span className="inline text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="premium-card p-6 bg-primary-50 border-none shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] text-primary-700 font-black uppercase tracking-widest mb-1 opacity-70">Total Users (전체 이용자)</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{users.filter(u => u.role === 'user').length} <span className="text-sm font-bold text-slate-400">명</span></p>
            </div>
            <button 
              onClick={() => { setNewUser({...newUser, role: 'user'}); setEditingUser(null); setIsUserModalOpen(true); }}
              className="bg-primary-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-900/10"
            >
              <Plus size={20} /> <span className="font-black text-sm">이용자 등록</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleBulkCharge}
              className="flex-1 bg-slate-800 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              <Coins size={24} />
              전체 정기 충전
            </button>
            {selectedUsers.length > 0 && (
              <button 
                onClick={() => { setChargingTarget('selected'); setIsChargeModalOpen(true); }}
                className="flex-1 bg-primary-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary-900/20 active:scale-95 transition-all animate-in zoom-in-95"
              >
                <Plus size={24} />
                {selectedUsers.length}명 선택 충전
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" placeholder="이름 또는 ID 검색"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white p-5 pl-14 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-lg"
              />
            </div>
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                  className={`premium-card p-5 group transition-all bg-white/80 backdrop-blur-sm cursor-pointer ${selectedUsers.includes(user.id) ? 'border-primary-500 ring-4 ring-primary-500/10' : 'hover:border-primary-300'} ${expandedUserId === user.id ? 'ring-2 ring-primary-500/10' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onClick={e => e.stopPropagation()}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <p className="font-black text-slate-900 text-lg tracking-tight leading-none">{user.name}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{user.grade}</span>
                          <p className="text-base text-primary-600 font-black tracking-tight leading-none ml-2">
                            <span className="text-[10px] text-slate-400 mr-1 italic">Balance:</span>
                            {user.points.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIndividualTargetId(user.id); setChargingTarget('individual'); setIsChargeModalOpen(true); }}
                          className="p-3 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                        >
                          <Plus size={22} className="stroke-[2.5]" />
                        </button>
                        <button onClick={(e) => openEditModal(user, e)} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={(e) => handleDeleteUser(user.id, e)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                  {expandedUserId === user.id && (
                    <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Phone (전화번호)</p>
                        <p className="text-sm font-bold text-slate-700">{user.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Birthdate (생년월일)</p>
                        <p className="text-sm font-bold text-slate-700">{user.birthdate}</p>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Address (주소)</p>
                        <p className="text-sm font-bold text-slate-700">{user.address || '주소 정보가 없습니다'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'admins' && isSuperAdmin && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="premium-card p-6 bg-slate-900 border-none text-white shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] text-white/50 font-black uppercase tracking-widest mb-0.5 opacity-70">Administrator Status (관리자 현황)</p>
                <p className="text-3xl font-black text-white tracking-tight">{users.filter(u => u.role === 'admin').length} <span className="text-sm font-bold text-white/30">명</span></p>
              </div>
            </div>
            <button 
              onClick={() => { setNewUser({...newUser, role: 'admin'}); setEditingUser(null); setIsUserModalOpen(true); }}
              className="bg-primary-600 hover:bg-primary-500 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-900/20"
            >
              <Plus size={20} /> <span className="font-black text-sm whitespace-nowrap">관리자 등록</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredAdmins.map(admin => (
              <div 
                key={admin.id} 
                className="premium-card p-5 flex items-center justify-between bg-white border border-slate-100 hover:border-amber-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <p className="font-black text-slate-900 text-lg tracking-tight leading-none">{admin.name}</p>
                    {admin.name === '백동희' 
                      ? <span className="bg-primary-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black italic shadow-sm">SUPER</span>
                      : <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black italic shadow-sm">ADMIN</span>
                    }
                    <p className="text-xs text-slate-400 font-bold tracking-tight ml-2">{admin.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => openEditModal(admin, e)} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                    <Edit2 size={20} />
                  </button>
                  {admin.name !== '백동희' && (
                    <button onClick={(e) => handleDeleteUser(admin.id, e)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 italic tracking-tighter">
              <Package className="text-primary-600" size={20} /> INVENTORY
            </h3>
            <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-500 transition-all active:scale-95 shadow-lg shadow-primary-900/10">
              <Plus size={14} /> 상품 추가
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Header (Desktop) */}
            <div className="hidden md:flex items-center px-6 py-3 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex-[2]">Product Name</div>
              <div className="flex-1 text-center">Price</div>
              <div className="flex-1 text-center">Stock</div>
              <div className="flex-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-50">
              {filteredProducts.map(product => (
                <div key={product.id} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-all group border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-base leading-none truncate">{product.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">#{product.id.slice(-6)}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[8px] text-slate-400 font-black uppercase mb-0.5">Price</p>
                      <p className="text-primary-600 font-black text-base leading-none">{product.price.toLocaleString()}원</p>
                    </div>

                    <div className="text-center min-w-[60px]">
                      <p className="text-[8px] text-slate-400 font-black uppercase mb-1">Stock</p>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black leading-none ${product.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                        Q: {product.stock}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => openProductEditModal(product)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                        <Edit2 size={16} />
                      </button>
                      
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => updateStock(product.id, 5)} className="w-[34px] h-[20px] rounded-md bg-slate-900 text-white flex items-center justify-center hover:bg-primary-600 transition-all text-[10px]">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => updateStock(product.id, -5)} className="w-[34px] h-[20px] rounded-md bg-slate-900 text-white flex items-center justify-center hover:bg-red-500 transition-all text-[10px]">
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-10 text-center text-slate-300 font-bold italic text-sm">No products found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 gap-4">
            <div className="premium-card p-6 bg-slate-900 text-white border-none shadow-xl flex items-center justify-between group min-h-[100px]">
              <div className="flex items-center gap-6 min-w-0 flex-1">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/40 shrink-0">
                  <Coins size={28} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0">
                  <h4 className="text-xl font-black italic tracking-tighter whitespace-nowrap shrink-0">거래 보고서</h4>
                  <div className="hidden sm:block h-6 w-px bg-white/20" />
                  <p className="text-sm text-primary-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis">총 거래액: {transactions.reduce((sum, t) => sum + (t.type === 'use' ? t.amount : 0), 0).toLocaleString()}원</p>
                </div>
              </div>
              <button onClick={() => exportToCSV('accounting')} className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-4 rounded-2xl transition-all shrink-0 ml-4 flex items-center gap-2">
                <Download size={20} /> <span className="text-xs font-black">CSV</span>
              </button>
            </div>

            <div className="premium-card p-6 bg-white border border-slate-100 shadow-sm flex items-center justify-between group min-h-[100px]">
              <div className="flex items-center gap-6 min-w-0 flex-1">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/10 text-white shrink-0">
                  <Package size={28} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0">
                  <h4 className="text-xl font-black italic tracking-tighter text-slate-900 whitespace-nowrap shrink-0">재고 현황 보고서</h4>
                  <div className="hidden sm:block h-6 w-px bg-slate-200" />
                  <p className="text-sm text-slate-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis">총 품목 수: {products.length} 품목</p>
                </div>
              </div>
              <button onClick={() => exportToCSV('inventory')} className="bg-slate-100 hover:bg-slate-900 text-slate-400 hover:text-white px-6 py-4 rounded-2xl transition-all shrink-0 ml-4 flex items-center gap-2">
                <Download size={20} /> <span className="text-xs font-black">CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charge Modal */}
      {isChargeModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsChargeModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
            <div>
              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
                {chargingTarget === 'individual' ? 'Individual Charge' : `${selectedUsers.length} Users Charge`}
              </h4>
              <p className="text-[10px] font-black mt-1 uppercase tracking-widest text-primary-600">
                {chargingTarget === 'individual' ? `충전 대상: ${users.find(u => u.id === individualTargetId)?.name}` : '선택한 이용자 전체 충전'}
              </p>
            </div>
            
            <form onSubmit={handleSelectedCharge} className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Charge Amount (원)</span>
                  <input 
                    type="number" required autoFocus
                    placeholder="예: 10000"
                    className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-black text-primary-600 text-2xl border border-transparent focus:border-primary-500/20 transition-all" 
                    value={chargeAmount || ''} 
                    onChange={e => setChargeAmount(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Description</span>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-slate-200 transition-all" 
                    value={chargeDescription} 
                    onChange={e => setChargeDescription(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {[5000, 10000, 30000, 50000].map(amt => (
                  <button key={amt} type="button" onClick={() => setChargeAmount(amt)} className="bg-slate-50 hover:bg-primary-50 hover:text-primary-600 p-3 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-primary-100">
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/20 mt-4 active:scale-95">
                <Coins size={20} /> 포인트 충전하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User/Admin Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsUserModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
            <div>
              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
                {editingUser 
                  ? (newUser.role === 'admin' ? 'Admin Update' : 'User Update') 
                  : (newUser.role === 'admin' ? 'New Admin Reg' : 'New User Reg')}
              </h4>
              <p className={`text-[10px] font-black mt-1 uppercase tracking-widest ${newUser.role === 'admin' ? 'text-amber-500' : 'text-primary-600'}`}>
                {newUser.role === 'admin' ? 'Administrator Management' : 'General User Management'}
              </p>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Name (이름)</span>
                  <input type="text" placeholder="이름" required className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold placeholder:text-slate-300 border border-transparent focus:border-slate-200 transition-all text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Birthdate (생년월일 6자리)</span>
                  <input type="text" placeholder="예: 950101" required maxLength={6} className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold placeholder:text-slate-300 border border-transparent focus:border-slate-200 transition-all text-sm" value={newUser.birthdate} onChange={e => setNewUser({...newUser, birthdate: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Phone (전화번호)</span>
                  <div className="flex gap-2">
                    <div className="px-5 flex items-center justify-center bg-slate-100 rounded-2xl font-black text-slate-400 text-sm">010</div>
                    <input 
                      type="text" placeholder=" 나머지 8자리" required maxLength={8} 
                      className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none font-bold placeholder:text-slate-300 border border-transparent focus:border-slate-200 transition-all text-sm" 
                      value={newUser.phoneMain} 
                      onChange={e => setNewUser({...newUser, phoneMain: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Password (비밀번호)</span>
                  <input type="text" placeholder="비밀번호" required className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold placeholder:text-slate-300 border border-transparent focus:border-slate-200 transition-all text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Address (주소)</span>
                  <input type="text" placeholder="주소" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold placeholder:text-slate-300 border border-transparent focus:border-slate-200 transition-all text-sm" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
                </div>
                
                {newUser.role === 'user' && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Socio-Economic Grade (복지 등급)</span>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none appearance-none font-black text-slate-800 text-xs tracking-widest border border-transparent focus:border-primary-500/20" value={newUser.grade} onChange={e => setNewUser({...newUser, grade: e.target.value as any})}>
                      <option value="미혼모">미혼모</option>
                      <option value="차상위">차상위</option>
                      <option value="저소득">저소득</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 mt-4 ${newUser.role === 'admin' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/10' : 'bg-slate-900 hover:bg-black shadow-slate-900/20'}`}>
                <Save size={20} /> {editingUser ? '정보 변경저장' : (newUser.role === 'admin' ? '관리자 정보 생성' : '이용자 정보 생성')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal remains the same */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsProductModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
            <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
              {editingProduct ? 'Product Update' : 'New Product Registration'}
            </h4>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="상품명" required className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Sale Price (원)</span>
                <input type="number" required className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-black text-primary-600" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Remaining Stock</span>
                <input type="number" required className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-black text-slate-800" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-primary-500 transition-all shadow-xl shadow-primary-900/20 mt-4">
                <Save size={20} /> {editingProduct ? '변경사항 저장' : '상품 정보 저장'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
