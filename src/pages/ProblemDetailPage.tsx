import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { getProblem } from '../services/problems';
import type { Problem, Solution, Feedback } from '../types';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProblem() {
      if (!id) return;
      try {
        const data = await getProblem(id);
        setProblem(data);
      } catch (err) {
        setError('Failed to load problem');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProblem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-[#5e7da5]/10 rounded animate-pulse mb-4" />
          <div className="h-12 w-full bg-[#5e7da5]/10 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-[#5e7da5]/10 rounded animate-pulse" />
            <div className="h-48 bg-[#5e7da5]/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">问题不存在</h2>
          <Link to="/" className="text-[#005bc4] hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const parseJsonField = (field: string | null): any => {
    if (!field) return null;
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[#575f72] hover:text-[#005bc4] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* Problem Header */}
        <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs font-medium bg-[#005bc4]/10 text-[#005bc4] rounded">
              {problem.platformName}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-[#575f72]/10 text-[#575f72] rounded">
              {problem.taskType}
            </span>
            <StatusBadge status={problem.status} />
            <StatusBadge status={problem.verificationStatus} />
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">{problem.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#575f72] mb-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {problem.viewCount} 次浏览
            </span>
            <span>更新于 {new Date(problem.updatedAt).toLocaleDateString('zh-CN')}</span>
            <span>
              提问者: {problem.createdBy?.nickname || '匿名用户'}
            </span>
          </div>

          {problem.summary && (
            <p className="text-[#575f72] mb-4">{problem.summary}</p>
          )}
        </div>

        {/* Problem Details */}
        <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">问题概述</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-[#575f72] mb-1">任务目标</div>
              <div className="text-[#1a1a1a]">{problem.goal}</div>
            </div>

            {problem.osType && (
              <div>
                <div className="text-sm font-medium text-[#575f72] mb-1">操作系统</div>
                <div className="text-[#1a1a1a]">{problem.osType}</div>
              </div>
            )}

            {problem.softwareVersion && (
              <div>
                <div className="text-sm font-medium text-[#575f72] mb-1">软件版本</div>
                <div className="text-[#1a1a1a]">{problem.softwareVersion}</div>
              </div>
            )}

            {problem.language && (
              <div>
                <div className="text-sm font-medium text-[#575f72] mb-1">界面语言</div>
                <div className="text-[#1a1a1a]">{problem.language}</div>
              </div>
            )}
          </div>

          {problem.errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-600 mb-1">报错信息</div>
              <div className="text-red-700 font-mono text-sm">{problem.errorMessage}</div>
            </div>
          )}
        </div>

        {/* Solutions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">标准解法</h2>
            {isLoggedIn && (
              <Link to={`/submit-solution/${problem.id}`}>
                <Button variant="outline" size="sm">补充解法</Button>
              </Link>
            )}
          </div>

          {(!problem.solutions || problem.solutions.length === 0) ? (
            <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-8 text-center">
              <p className="text-[#575f72] mb-4">暂无解法</p>
              {isLoggedIn ? (
                <Link to={`/submit-solution/${problem.id}`}>
                  <Button>成为第一个提供解法的人</Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button>登录后提供解法</Button>
                </Link>
              )}
            </div>
          ) : (
            problem.solutions.map((solution) => {
              const steps = parseJsonField(solution.steps);
              const environment = parseJsonField(solution.applicableEnvironment);

              return (
                <div key={solution.id} className="bg-white rounded-xl border border-[#5e7da5]/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={solution.verificationStatus} />
                    {solution.verificationCount > 0 && (
                      <span className="text-xs text-[#575f72]">
                        验证 {solution.verificationCount} 次
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">{solution.title}</h3>

                  {environment && (
                    <div className="mb-4 p-4 bg-[#fafafa] rounded-lg">
                      <div className="text-sm font-medium text-[#575f72] mb-2">适用环境</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(environment).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 text-xs bg-white border border-[#5e7da5]/20 rounded">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {solution.rootCause && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm font-medium text-yellow-700 mb-1">根因分析</div>
                      <div className="text-yellow-800">{solution.rootCause}</div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-sm font-medium text-[#575f72] mb-3">解决步骤</div>
                    <div className="space-y-3">
                      {Array.isArray(steps) && steps.map((step: any, index: number) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#005bc4] text-white text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-[#1a1a1a]">{step.title}</div>
                            <div className="text-sm text-[#575f72] mt-1">{step.description}</div>
                            {step.notes && (
                              <div className="text-xs text-[#575f72]/70 mt-1 italic">{step.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {solution.verificationMethod && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        验证方法
                      </div>
                      <div className="text-green-800">{solution.verificationMethod}</div>
                    </div>
                  )}

                  {solution.invalidConditions && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                        <XCircle className="w-4 h-4" />
                        已知失效边界
                      </div>
                      <div className="text-red-800">{solution.invalidConditions}</div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  <div className="mt-6 pt-6 border-t border-[#5e7da5]/10">
                    <div className="text-sm font-medium text-[#575f72] mb-3">这个解法对你有效吗？</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        有效
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        无效
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        部分有效
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
