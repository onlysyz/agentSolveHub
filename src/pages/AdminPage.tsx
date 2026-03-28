import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { FileText, Lightbulb, Tags, Search, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import type { Problem, Solution, Feedback } from '../types';

type Section = 'problems' | 'solutions' | 'feedback' | 'tags';

export function AdminPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get('section') as Section) || 'problems';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setSection = (newSection: Section) => {
    setSearchParams({ section: newSection });
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    async function fetchData() {
      setIsLoading(true);
      try {
        if (section === 'problems') {
          const res = await apiRequest<{ data: Problem[] }>('/problems?limit=50');
          setProblems(res.data);
        } else if (section === 'solutions') {
          const res = await apiRequest<{ data: Solution[] }>('/solutions?limit=50');
          setSolutions(res.data);
        } else if (section === 'feedback') {
          const res = await apiRequest<{ data: Feedback[] }>('/feedback?limit=50');
          setFeedback(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, section]);

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

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">权限不足</h2>
          <p className="text-[#575f72] mb-4">您没有访问后台管理的权限</p>
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">后台管理</h1>
          <p className="text-[#575f72]">管理系统问题、解法和用户反馈</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'problems', label: '问题管理', icon: FileText },
            { key: 'solutions', label: '解法管理', icon: Lightbulb },
            { key: 'feedback', label: '用户反馈', icon: AlertCircle },
            { key: 'tags', label: '标签管理', icon: Tags },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key as Section)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                section === item.key
                  ? 'bg-[#005bc4] text-white'
                  : 'bg-white text-[#575f72] hover:bg-[#575f72]/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-[#5e7da5]/10 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#005bc4] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : section === 'problems' ? (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#5e7da5]/10">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">标题</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">平台</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">状态</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">操作</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id} className="border-b border-[#5e7da5]/10 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/problems/${problem.id}`} className="text-[#005bc4] hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#575f72]">{problem.platformName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={problem.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">编辑</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : section === 'solutions' ? (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#5e7da5]/10">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">解法标题</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">关联问题</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">验证状态</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">操作</th>
                </tr>
              </thead>
              <tbody>
                {solutions.map((solution) => (
                  <tr key={solution.id} className="border-b border-[#5e7da5]/10 last:border-0">
                    <td className="px-4 py-3 text-sm text-[#1a1a1a]">{solution.title}</td>
                    <td className="px-4 py-3 text-sm text-[#575f72]">
                      {solution.problem?.title || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={solution.verificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">编辑</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : section === 'feedback' ? (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#5e7da5]/10">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">反馈类型</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">用户</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">评论</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#575f72]">时间</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((fb) => (
                  <tr key={fb.id} className="border-b border-[#5e7da5]/10 last:border-0">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        fb.resultType === 'effective' ? 'bg-green-100 text-green-700' :
                        fb.resultType === 'ineffective' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {fb.resultType === 'effective' ? '有效' : fb.resultType === 'ineffective' ? '无效' : '部分有效'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#575f72]">
                      {fb.user?.nickname || '匿名用户'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#575f72]">
                      {fb.comment || fb.environmentNote || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#575f72]">
                      {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <Tags className="w-12 h-12 text-[#575f72] mx-auto mb-4" />
              <p className="text-[#575f72]">标签管理功能开发中</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
