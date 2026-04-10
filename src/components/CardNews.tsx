import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Users, ArrowRight, CreditCard, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react'

const cards = [
  {
    id: 1,
    type: '홍보',
    tag: 'BRANDING',
    titleLeft: '우리 동네 상설 무료 마켓',
    titleMain: '드림마켓',
    subtitle: 'Dream Market',
    description: '예수인교회가 정성껏 준비한 선한 나눔의 장터입니다. 필요한 물품을 직접 고르는 즐거움을 누려보세요.',
    points: '매월 50,000 포인트 지원',
    detail: '직접 방문하여 생필품 구입',
    bgGradient: 'from-amber-500/90 to-orange-600/90',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1080', // Replace with dream_news_bg_1
    icon: <Sparkles className="text-amber-400" size={24} />
  },
  {
    id: 2,
    type: '모집',
    tag: 'RECRUITMENT',
    titleLeft: '드림마켓과 함께하는',
    titleMain: '이용자 신청 안내',
    subtitle: 'Apply Now',
    description: '미혼모 및 기초생활수급자분들을 위한 특별한 지원 프로그램입니다. 지금 바로 따뜻한 내일을 신청하세요.',
    points: '매월 5만원 상당 포인트',
    detail: '미혼모, 기초생활수급자 대상',
    bgGradient: 'from-blue-600/90 to-indigo-800/90',
    image: 'https://images.unsplash.com/photo-1574607383476-f517f220d35a?auto=format&fit=crop&q=80&w=1080', // Replace with dream_news_bg_2
    icon: <Users className="text-blue-400" size={24} />
  }
]

export const CardNews = () => {
  return (
    <div className="space-y-8">
      {/* Header with Church Identity */}
      <div className="flex items-center justify-between px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <img src="/church-logo.png" alt="예수인교회" className="h-5 w-auto" />
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Information</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">드림마켓 소식</h3>
        </div>
        <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x no-scrollbar">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ y: -8 }}
            className="flex-shrink-0 w-[320px] snap-center relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-slate-100">
              <img src={card.image} alt={card.titleMain} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} mix-blend-multiply opacity-80`} />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full p-8 flex flex-col justify-between text-white">
              {/* Top Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/20">
                    {card.icon}
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-[10px] font-bold tracking-widest">{card.tag}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-white/80 font-medium tracking-tight text-sm">{card.titleLeft}</p>
                  <h4 className="text-3xl font-black leading-none tracking-tighter">
                    {card.titleMain}
                  </h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">{card.subtitle}</p>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="space-y-6">
                <p className="text-white/90 text-sm leading-relaxed font-medium line-clamp-2">
                  {card.description}
                </p>

                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Benefit</p>
                      <p className="text-xs font-bold">{card.points}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-green-300" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Eligibility</p>
                      <p className="text-xs font-bold">{card.detail}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full group bg-white text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-lg">
                  {card.type === '홍보' ? '더 자세히 알아보기' : '지금 지원하기'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Third "Market Map" Card Mockup */}
        <motion.div
           whileHover={{ y: -8 }}
           className="flex-shrink-0 w-[320px] snap-center relative aspect-square rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl shadow-slate-200"
        >
          <div className="absolute inset-0 opacity-40">
            <div className="grid grid-cols-6 h-full gap-2 p-4">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            <div className="space-y-4">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 w-fit">
                    <MapPin className="text-primary-400" size={24} />
                  </div>
              <h4 className="text-3xl font-black leading-tight tracking-tighter">
                마켓 방문<br />안내
              </h4>
            </div>
            <div className="space-y-4">
              <p className="text-white/60 text-sm">
                예수인교회 본관 1층에 위치하고 있습니다. 누구나 따뜻하게 환영합니다.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/80">운영시간: 화~토 10:00 - 17:00</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
