import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, FileText, Lightbulb, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import type { Problem, Solution } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type Tab = 'problems' | 'solutions' | 'drafts';

export function ProfilePage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'problems';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [problemsRes, solutionsRes] = await Promise.all([
          apiRequest<{ data: Problem[] }>(`/users/${user.id}/problems`),
          apiRequest<{ data: Solution[] }>(`/users/${user.id}/solutions`),
        ]);
        setProblems(problemsRes.data);
        setSolutions(solutionsRes.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#005bc4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#575f72]">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-[#575f72] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">请先登录</h2>
          <Link to="/login">
            <Button>登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#005bc4]/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
              ) : (
                <User className="w-8 h-8 text-[#005bc4]" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">
                {user.nickname || user.email.split('@')[0]}
              </h1>
              <p className="text-[#575f72]">{user.email}</p>
              <p className="text-sm text-[#575f72] mt-1">
                加入于 {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '最近'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#5e7da5]/10 mb-6">
          <button
            onClick={() => setTab('problems')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'problems'
                ? 'border-[#005bc4] text-[#005bc4]'
                : 'border-transparent text-[#575f72] hover:text-[#1a1a1a]'
            }`}
          >
            <FileText className="w-4 h-4" />
            我的问题 ({problems.length})
          </button>
          <button
            onClick={() => setTab('solutions')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'solutions'
                ? 'border-[#005bc4] text-[#005bc4]'
                : 'border-transparent text-[#575f72] hover:text-[#1a1a1a]'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            我的解法 ({solutions.length})
          </button>
          <button
            onClick={() => setTab('drafts')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'drafts'
                ? 'border-[#005bc4] text-[#005bc4]'
                : 'border-transparent text-[#575f72] hover:text-[#1a1a1a]'
            }`}
          >
            <Clock className="w-4 h-4" />
            草稿
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tab === 'problems' ? (
          problems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#5e7da5]/10">
              <FileText className="w-12 h-12 text-[#575f72] mx-auto mb-4" />
              <p className="text-[#575f72] mb-4">还没有提交问题</p>
              <Link to="/submit-problem">
                <Button>提交第一个问题</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="block p-4 bg-white rounded-xl border border-[#5e7da5]/10 hover:border-[#005bc4]/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-[#005bc4]/10 text-[#005bc4] rounded">
                      {problem.platformName}
                    </span>
                    <StatusBadge status={problem.status} />
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">{problem.title}</h3>
                  <p className="text-sm text-[#575f72] mt-1">
                    更新于 {new Date(problem.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </Link>
              ))}
            </div>
          )
        ) : tab === 'solutions' ? (
          solutions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#5e7da5]/10">
              <Lightbulb className="w-12 h-12 text-[#575f72] mx-auto mb-4" />
              <p className="text-[#575f72] mb-4">还没有提供解法</p>
              <Link to="/">
                <Button>浏览问题</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {solutions.map((solution) => (
                <Link
                  key={solution.id}
                  to={`/problems/${solution.problemId}`}
                  className="block p-4 bg-white rounded-xl border border-[#5e7da5]/10 hover:border-[#005bc4]/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={solution.verificationStatus} />
                    {solution.verificationCount > 0 && (
                      <span className="text-xs text-[#575f72]">验证 {solution.verificationCount} 次</span>
                    )}
                  </div>
                  <h3 className="font-medium text-[#1a1a1a]">{solution.title}</h3>
                  {solution.problem && (
                    <p className="text-sm text-[#575f72] mt-1">
                      关联问题: {solution.problem.title}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#5e7da5]/10">
            <Clock className="w-12 h-12 text-[#575f72] mx-auto mb-4" />
            <p className="text-[#575f72]">暂无草稿</p>
          </div>
        )}
      </div>
    </div>
  );
}
