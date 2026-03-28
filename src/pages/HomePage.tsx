import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, ArrowRight, Monitor, Upload, Settings, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { getProblems } from '../services/problems';
import type { Problem } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InstallCLI } from '../components/ui/InstallCLI';

const HOT_PLATFORMS = ['Chrome', 'Notion', 'CapCut', 'Excel', 'Docker', 'Figma'];
const HOT_TASKS = ['上传文件', '导出视频', '登录验证', '弹窗处理'];

const FEATURES = [
  {
    icon: Monitor,
    title: '结构化问题',
    description: '记录任务目标、环境、报错与已尝试步骤',
  },
  {
    icon: CheckCircle2,
    title: '可执行解法',
    description: '提供步骤、替代路径、验证方法与失效边界',
  },
  {
    icon: Shield,
    title: '面向 Agent',
    description: '不仅适合人读，也适合后续结构化调用',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSolutions, setRecentSolutions] = useState<Problem[]>([]);
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [solutionsRes, problemsRes] = await Promise.all([
          getProblems({ limit: 6, verificationStatus: 'verified' }),
          getProblems({ limit: 8 }),
        ]);
        setRecentSolutions(solutionsRes.data);
        setRecentProblems(problemsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#005bc4]/5 to-transparent py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4"
          >
            让 Agent 更快找到可执行的解法
          </motion.h1>
          <p className="text-lg text-[#575f72] mb-8 max-w-2xl mx-auto">
            面向 AI Agent 执行问题的结构化解法库，覆盖浏览器、桌面软件与常见工具操作
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#575f72]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="你的 Agent 卡在哪一步？"
                className="w-full pl-12 pr-32 py-4 rounded-xl border border-[#5e7da5]/30 bg-white text-[#1a1a1a] placeholder-[#575f72]/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#005bc4]/30 focus:border-[#005bc4]"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                搜索
              </Button>
            </div>
          </form>

          {/* Hot Platforms */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-[#575f72]">热门软件:</span>
            {HOT_PLATFORMS.map((platform) => (
              <Link
                key={platform}
                to={`/categories?platform=${platform}`}
                className="px-3 py-1 text-sm text-[#005bc4] bg-[#005bc4]/10 rounded-full hover:bg-[#005bc4]/20 transition-colors"
              >
                {platform}
              </Link>
            ))}
          </div>

          {/* Install CLI */}
          <div className="mt-8 max-w-2xl mx-auto">
            <InstallCLI />
          </div>

          {/* Hot Tasks */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-[#575f72]">热门任务:</span>
            {HOT_TASKS.map((task) => (
              <Link
                key={task}
                to={`/search?task=${encodeURIComponent(task)}`}
                className="px-3 py-1 text-sm text-[#575f72] hover:text-[#005bc4] transition-colors"
              >
                {task}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-[#fafafa] border border-[#5e7da5]/10"
              >
                <div className="w-12 h-12 rounded-lg bg-[#005bc4]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#005bc4]" />
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#575f72]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Verified Solutions */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">最近验证通过的解法</h2>
            <Link
              to="/search?verificationStatus=verified"
              className="flex items-center gap-1 text-sm text-[#005bc4] hover:text-[#004a9f] transition-colors"
            >
              查看更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-[#5e7da5]/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSolutions.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="group p-5 rounded-xl bg-white border border-[#5e7da5]/10 hover:border-[#005bc4]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-0.5 text-xs font-medium bg-[#005bc4]/10 text-[#005bc4] rounded">
                      {problem.platformName}
                    </span>
                    <StatusBadge status={problem.verificationStatus} />
                  </div>
                  <h3 className="font-medium text-[#1a1a1a] group-hover:text-[#005bc4] line-clamp-2 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-[#575f72] line-clamp-2">{problem.summary || problem.goal}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Problems */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">最近新增问题</h2>
            <Link
              to="/search?sort=createdAt&order=desc"
              className="flex items-center gap-1 text-sm text-[#005bc4] hover:text-[#004a9f] transition-colors"
            >
              查看更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-[#5e7da5]/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[#fafafa] border border-[#5e7da5]/10 hover:border-[#005bc4]/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#575f72]/10 text-[#575f72] rounded">
                        {problem.platformName}
                      </span>
                      <StatusBadge status={problem.status} />
                    </div>
                    <h3 className="font-medium text-[#1a1a1a] group-hover:text-[#005bc4] truncate">
                      {problem.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#575f72] group-hover:text-[#005bc4] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#005bc4] to-[#695781]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">没找到适合你的解法？</h2>
          <p className="text-white/80 mb-6">
            提交你的 Agent 问题，我们帮你把它整理成结构化问题卡片
          </p>
          <Link to="/submit-problem">
            <Button variant="secondary" size="lg" className="bg-white text-[#005bc4] hover:bg-white/90">
              立即提交问题
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
