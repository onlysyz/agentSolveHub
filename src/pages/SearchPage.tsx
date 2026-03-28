import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronRight } from 'lucide-react';
import { getProblems, GetProblemsParams } from '../services/problems';
import type { Problem, Category } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const PLATFORMS = ['Chrome', 'Notion', 'CapCut', 'Excel', 'Docker', 'Figma', 'Slack', 'Zoom'];
const TASK_TYPES = ['upload', 'export', 'login', 'automation', 'api', 'settings', 'collaboration'];
const OS_TYPES = ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'iOS', 'Android'];
const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待补充' },
  { value: 'available', label: '已有解法' },
  { value: 'solved', label: '已解决' },
  { value: 'verified', label: '已验证' },
];
const VERIFICATION_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'unverified', label: '未验证' },
  { value: 'community_verified', label: '社区验证' },
  { value: 'verified', label: '已验证' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('query') || '';
  const platform = searchParams.get('platform') || '';
  const taskType = searchParams.get('taskType') || '';
  const osType = searchParams.get('osType') || '';
  const status = searchParams.get('status') || '';
  const verification = searchParams.get('verification') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true);
      try {
        const params: GetProblemsParams = {
          page,
          limit: 20,
          search: query || undefined,
          platform: platform || undefined,
          taskType: taskType || undefined,
          osType: osType || undefined,
          status: status || undefined,
          verificationStatus: verification || undefined,
          sort,
          order: order as 'asc' | 'desc',
        };
        const res = await getProblems(params);
        setProblems(res.data);
        setPagination(res.pagination);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProblems();
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = platform || taskType || osType || status || verification;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateParam('query', formData.get('query') as string);
            }}
            className="relative max-w-2xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#575f72]" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="搜索问题..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#5e7da5]/30 bg-white text-[#1a1a1a] placeholder-[#575f72]/50 focus:outline-none focus:ring-2 focus:ring-[#005bc4]/30 focus:border-[#005bc4]"
            />
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#5e7da5]/30 rounded-lg hover:bg-[#575f72]/5 transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>

            {platform && (
              <span className="flex items-center gap-1 px-3 py-1 text-sm bg-[#005bc4]/10 text-[#005bc4] rounded-full">
                {platform}
                <button onClick={() => updateParam('platform', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#575f72] hover:text-[#005bc4] transition-colors"
              >
                清除全部
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[#575f72]">排序:</span>
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-');
                  updateParam('sort', newSort);
                  updateParam('order', newOrder);
                }}
                className="text-sm border border-[#5e7da5]/30 rounded px-2 py-1 bg-white"
              >
                <option value="createdAt-desc">最新发布</option>
                <option value="updatedAt-desc">最近更新</option>
                <option value="verificationStatus-desc">验证优先</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-4 space-y-6">
                <div>
                  <h3 className="font-medium text-[#1a1a1a] mb-3">软件/平台</h3>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="platform"
                          checked={platform === p}
                          onChange={() => updateParam('platform', p)}
                          className="w-4 h-4 text-[#005bc4]"
                        />
                        <span className="text-sm text-[#575f72]">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[#1a1a1a] mb-3">任务类型</h3>
                  <div className="space-y-2">
                    {TASK_TYPES.map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="taskType"
                          checked={taskType === t}
                          onChange={() => updateParam('taskType', t)}
                          className="w-4 h-4 text-[#005bc4]"
                        />
                        <span className="text-sm text-[#575f72]">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[#1a1a1a] mb-3">操作系统</h3>
                  <div className="space-y-2">
                    {OS_TYPES.map((os) => (
                      <label key={os} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="osType"
                          checked={osType === os}
                          onChange={() => updateParam('osType', os)}
                          className="w-4 h-4 text-[#005bc4]"
                        />
                        <span className="text-sm text-[#575f72]">{os}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[#1a1a1a] mb-3">问题状态</h3>
                  <select
                    value={status}
                    onChange={(e) => updateParam('status', e.target.value)}
                    className="w-full text-sm border border-[#5e7da5]/30 rounded px-2 py-1.5 bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-[#1a1a1a] mb-3">验证状态</h3>
                  <select
                    value={verification}
                    onChange={(e) => updateParam('verification', e.target.value)}
                    className="w-full text-sm border border-[#5e7da5]/30 rounded px-2 py-1.5 bg-white"
                  >
                    {VERIFICATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-[#575f72]">
              找到 {pagination.total} 个结果
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-white animate-pulse" />
                ))}
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[#5e7da5]/10">
                <p className="text-[#575f72] mb-4">暂时没有找到完全匹配的问题</p>
                <Link to="/submit-problem">
                  <Button>提交问题</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {problems.map((problem) => (
                  <Link
                    key={problem.id}
                    to={`/problems/${problem.id}`}
                    className="group block p-5 bg-white rounded-xl border border-[#5e7da5]/10 hover:border-[#005bc4]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#005bc4]/10 text-[#005bc4] rounded">
                            {problem.platformName}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#575f72]/10 text-[#575f72] rounded">
                            {problem.taskType}
                          </span>
                          <StatusBadge status={problem.status} />
                          <StatusBadge status={problem.verificationStatus} />
                        </div>
                        <h3 className="font-medium text-[#1a1a1a] group-hover:text-[#005bc4] mb-1">
                          {problem.title}
                        </h3>
                        <p className="text-sm text-[#575f72] line-clamp-2">
                          {problem.summary || problem.goal}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#575f72] group-hover:text-[#005bc4] transition-colors flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#575f72]">
                      {problem._count?.solutions !== undefined && (
                        <span>{problem._count.solutions} 个解法</span>
                      )}
                      <span>更新于 {new Date(problem.updatedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <button
                    onClick={() => updateParam('page', String(page - 1))}
                    className="px-4 py-2 text-sm border border-[#5e7da5]/30 rounded hover:bg-[#575f72]/5"
                  >
                    上一页
                  </button>
                )}
                <span className="px-4 py-2 text-sm">
                  第 {page} / {pagination.totalPages} 页
                </span>
                {page < pagination.totalPages && (
                  <button
                    onClick={() => updateParam('page', String(page + 1))}
                    className="px-4 py-2 text-sm border border-[#5e7da5]/30 rounded hover:bg-[#575f72]/5"
                  >
                    下一页
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
