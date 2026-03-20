import { useState } from 'react'
import { useMarketStore } from './store/useMarketStore'
import { LoginPage } from './pages/LoginPage'
import { UserPage } from './pages/UserPage'
import { StorePage } from './pages/StorePage'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { LogOut, Wallet, Smartphone, ShieldCheck, Home } from 'lucide-react'

function App() {
  const { currentUser, setCurrentUser } = useMarketStore()
  const [activeTab, setActiveTab] = useState<'home' | 'user' | 'store' | 'admin'>('home')

  if (!currentUser) {
    return <LoginPage />
  }

  const isAdmin = currentUser.role === 'admin'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <header className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">드림마켓</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-black text-slate-800 tracking-tight">{currentUser.name} {isAdmin ? <span className="text-amber-500 ml-0.5">관리자</span> : '회원'}</span>
              <div className="w-px h-3 bg-slate-200 mx-1" />
              <img src="/church-logo.png" alt="예수인교회" className="h-6 w-auto object-contain" />
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'user' && <UserPage />}
        {activeTab === 'store' && <StorePage />}
        {activeTab === 'admin' && isAdmin && <AdminPage />}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <nav className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-slate-100 px-6 py-3 flex justify-around items-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <button 
            onClick={() => setActiveTab('home')}
            className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-primary-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-primary-50' : 'group-hover:bg-slate-50'}`}>
              <Home size={activeTab === 'home' ? 24 : 22} />
            </div>
            <span className="text-[10px] font-bold">홈</span>
          </button>

          <button 
            onClick={() => setActiveTab('user')}
            className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'user' ? 'text-primary-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'user' ? 'bg-primary-50' : 'group-hover:bg-slate-50'}`}>
              <Wallet size={activeTab === 'user' ? 24 : 22} />
            </div>
            <span className="text-[10px] font-bold">이용자</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('store')}
            className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'store' ? 'text-primary-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'store' ? 'bg-primary-50' : 'group-hover:bg-slate-50'}`}>
              <Smartphone size={activeTab === 'store' ? 24 : 22} />
            </div>
            <span className="text-[10px] font-bold">매장</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`group flex flex-col items-center gap-1.5 transition-all ${activeTab === 'admin' ? 'text-primary-600' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-primary-50' : 'group-hover:bg-slate-50'}`}>
                <ShieldCheck size={activeTab === 'admin' ? 24 : 22} />
              </div>
              <span className="text-[10px] font-bold">관리자</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  )
}

export default App
