import React from 'react'
import { Heart, Sparkles, BookOpen, Users, Church } from 'lucide-react'
import { motion } from 'framer-motion'
import { CardNews } from '../components/CardNews'

export const HomePage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.section 
        variants={item}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white shadow-2xl shadow-primary-200"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/20">
            <Sparkles size={16} className="text-yellow-300" />
            <span>예수인교회의 특별한 나눔</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            꿈이 현실로,<br />
            <span className="text-yellow-300">드림마켓</span>에 오신 걸<br />
            환영합니다
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-[280px]">
            작은 나눔이 모여 커다란 사랑을 만드는 공간, 예수인교회가 정성으로 운영합니다.
          </p>
        </div>
      </motion.section>

      {/* Card News Section */}
      <motion.section variants={item}>
        <CardNews />
      </motion.section>

      {/* Intro Cards */}
      <div className="grid gap-6">
        <motion.div variants={item} className="premium-card p-6 border-l-4 border-l-primary-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="text-primary-600" size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">드림마켓의 의미</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                '드림(Dream)'은 우리의 꿈인 동시에, 서로에게 사랑을 '드림'을 의미합니다. 
                함께 나누며 성장하는 공동체를 꿈꾸는 마켓입니다.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="premium-card p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Church className="text-indigo-600" size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">운영 취지</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                예수인교회는 다음 세대가 하나님의 사랑 안에서 건강하게 자라나길 기도합니다. 
                드림마켓은 경제적 나눔을 넘어, 신앙 공동체의 온기를 전하고자 시작되었습니다.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="premium-card p-6 border-l-4 border-l-purple-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-purple-600" size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">우리의 목적</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                기독교적 가치관에 기반한 올바른 나눔의 문화를 배우고 실천합니다. 
                모든 성도가 한 가족처럼 서로의 필요를 채워주며 하나님의 나라를 세워나가는 것이 목적입니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Community Info */}
      <motion.section 
        variants={item}
        className="bg-slate-100/50 rounded-[2rem] p-8 text-center space-y-4 border border-slate-200"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-inner flex items-center justify-center mb-2">
            <img src="/church-logo.png" alt="Jesus Church" className="w-14 h-14 object-contain transition-transform hover:scale-110" />
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">예수인교회 (Jesusin Church)</h4>
          <p className="text-slate-500 text-xs">사랑으로 세상을 변화시키는 믿음의 공동체</p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Users size={14} className="text-primary-500" />
            <span>성도 참여 500+</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Sparkles size={14} className="text-indigo-500" />
            <span>나눔 누적 10,000+</span>
          </div>
        </div>
      </motion.section>
      
      <motion.div variants={item} className="pb-8 text-center">
        <p className="text-slate-400 text-xs font-medium">
          © 2024 드림마켓 by 예수인교회. All rights reserved.
        </p>
      </motion.div>
    </motion.div>
  )
}
