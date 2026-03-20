import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Lock, Smartphone, Calendar, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';

export const LoginPage = () => {
  const { users, setCurrentUser } = useMarketStore();
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [formData, setFormData] = useState({
    birthdate: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedBirthdate = formData.birthdate.trim();
    const trimmedPassword = formData.password.trim();
    const cleanInputPhone = formData.phone.replace(/[^0-9]/g, '');

    const user = users.find(u => {
      const cleanStoredPhone = u.phone.replace(/[^0-9]/g, '');
      return (
        u.role === loginType &&
        (u.birthdate === trimmedBirthdate || u.name === trimmedBirthdate) && 
        cleanStoredPhone === cleanInputPhone && 
        u.password === trimmedPassword
      );
    });

    if (user) {
      setCurrentUser(user);
    } else {
      setError('입력하신 정보와 일치하는 계정이 없습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${loginType === 'user' ? 'bg-primary-600/20' : 'bg-amber-500/20'}`} />
      <div className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-1000 ${loginType === 'user' ? 'bg-indigo-500/10' : 'bg-red-500/10'}`} />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] shadow-2xl mb-2 border border-white/20 p-4">
            <img src="/church-logo.png" alt="Yesuin Church" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">DREAM MARKET</h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Premium Membership Service</p>
          </div>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-white/5 p-1 rounded-[1.5rem] mb-6 backdrop-blur-xl border border-white/10">
          <button 
            onClick={() => { setLoginType('user'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${loginType === 'user' ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <UserIcon size={16} />
            교우님 (회원)
          </button>
          <button 
            onClick={() => { setLoginType('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${loginType === 'admin' ? 'bg-amber-500 text-white shadow-xl shadow-amber-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ShieldCheck size={16} />
            마켓 관리자
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4 bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="pb-2">
              <h2 className="text-xl font-black text-white">
                {loginType === 'user' ? '회원 로그인' : '관리자 로그인'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">정보를 정확히 입력해주세요</p>
            </div>

            {/* Birthdate */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter">Name or Birthdate (성함 또는 생년월일)</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input
                  type="text" placeholder="예: 백동희 또는 800101"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter">Phone (전화번호)</label>
              <div className="relative group">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input
                  type="text" placeholder="010-xxxx-xxxx (전체)" maxLength={15}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-tighter">Password (비밀번호)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input
                  type="password" placeholder="비밀번호 입력"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-black text-center py-2 animate-bounce">{error}</p>
            )}

            <button
              type="submit"
              className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group mt-4 ${loginType === 'user' ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/20' : 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/20'}`}
            >
              시작하기
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {loginType === 'admin' && (
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Default Admin Account</p>
            <p className="text-xs text-amber-200/60 font-medium">백동희 또는 800101 / 01011112222 / admin</p>
          </div>
        )}
      </div>
    </div>
  );
};
