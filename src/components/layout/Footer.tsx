import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white transition-colors">关于我们</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">使用说明</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">联系方式</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">资源</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/categories" className="hover:text-white transition-colors">问题分类</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">搜索问题</Link></li>
              <li><Link to="/submit-problem" className="hover:text-white transition-colors">提交问题</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">法律</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/privacy" className="hover:text-white transition-colors">隐私政策</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">服务条款</Link></li>
            </ul>
          </div>
          <div>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#005bc4] to-[#695781] flex items-center justify-center mb-4">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <p className="text-sm text-white/70">
              面向 AI Agent 执行问题的结构化解法库
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Agent Solve Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
