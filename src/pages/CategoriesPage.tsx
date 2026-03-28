import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { apiRequest } from '../services/api';
import type { Category } from '../types';

const POPULAR_CATEGORIES = [
  {
    name: 'Chrome',
    tasks: ['下载', '上传', '扩展设置', '标签页切换', '权限弹窗'],
  },
  {
    name: 'Notion',
    tasks: ['数据库操作', '页面编辑', '导入导出', '权限管理', 'API集成'],
  },
  {
    name: 'CapCut',
    tasks: ['视频导出', '字幕添加', '转场效果', '音频处理', '批量操作'],
  },
  {
    name: 'Excel',
    tasks: ['公式计算', '数据导入', '图表制作', '宏自动化', '跨表引用'],
  },
  {
    name: 'Docker',
    tasks: ['镜像构建', '容器运行', '网络配置', '数据持久化', 'docker-compose'],
  },
  {
    name: 'Figma',
    tasks: ['设计协作', '组件复用', '自动布局', '导出资源', '插件开发'],
  },
];

const TASK_CATEGORIES = [
  { name: '上传文件', icon: '📤', description: '各类文件上传问题' },
  { name: '导出视频', icon: '🎬', description: '视频导出和格式转换' },
  { name: '登录验证', icon: '🔐', description: '登录和认证相关问题' },
  { name: '弹窗处理', icon: '🔔', description: '弹窗和对话框操作' },
  { name: '自动化脚本', icon: '⚡', description: '自动化和脚本执行' },
  { name: 'API调用', icon: '🔌', description: 'API集成和调用问题' },
];

export function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const platform = searchParams.get('platform');
  const [platformStats, setPlatformStats] = useState<Category[]>([]);
  const [taskStats, setTaskStats] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [platforms, tasks] = await Promise.all([
          apiRequest<Category[]>('/categories/platforms'),
          apiRequest<Category[]>('/categories/task-types'),
        ]);
        setPlatformStats(platforms);
        setTaskStats(tasks);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchStats();
  }, []);

  if (platform) {
    const category = POPULAR_CATEGORIES.find((c) => c.name.toLowerCase() === platform.toLowerCase());
    if (category) {
      return (
        <div className="min-h-screen bg-[#fafafa]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">{platform}</h1>
              <p className="text-[#575f72]">
                浏览 {platform} 相关的所有问题
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 mb-6">
              <h2 className="font-semibold text-[#1a1a1a] mb-4">子分类</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {category.tasks.map((task) => (
                  <Link
                    key={task}
                    to={`/search?platform=${platform}&taskType=${task.toLowerCase()}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#5e7da5]/10 hover:border-[#005bc4]/30 hover:bg-[#005bc4]/5 transition-all"
                  >
                    <span className="text-sm text-[#1a1a1a]">{task}</span>
                    <ChevronRight className="w-4 h-4 text-[#575f72]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6">
              <h2 className="font-semibold text-[#1a1a1a] mb-4">热门问题</h2>
              <Link
                to={`/search?platform=${platform}`}
                className="block p-4 rounded-lg border border-[#5e7da5]/10 hover:border-[#005bc4]/30 transition-all"
              >
                <span className="text-[#005bc4]">查看所有 {platform} 问题 →</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">问题分类</h1>
          <p className="text-[#575f72]">按软件平台或任务类型浏览问题</p>
        </div>

        {/* Platform Categories */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">按软件/平台</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_CATEGORIES.map((category) => {
              const stats = platformStats.find((p) => p.name.toLowerCase() === category.name.toLowerCase());
              return (
                <Link
                  key={category.name}
                  to={`/categories?platform=${category.name}`}
                  className="group p-5 bg-white rounded-xl border border-[#5e7da5]/10 hover:border-[#005bc4]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 text-sm font-medium bg-[#005bc4]/10 text-[#005bc4] rounded-full">
                      {category.name}
                    </span>
                    {stats && (
                      <span className="text-sm text-[#575f72]">{stats.count} 个问题</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.tasks.slice(0, 3).map((task) => (
                      <span key={task} className="text-xs text-[#575f72]">
                        {task}
                      </span>
                    ))}
                    {category.tasks.length > 3 && (
                      <span className="text-xs text-[#575f72]">+{category.tasks.length - 3} 更多</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Task Categories */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">按任务类型</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TASK_CATEGORIES.map((category) => {
              const stats = taskStats.find((t) => t.name.toLowerCase() === category.name.toLowerCase());
              return (
                <Link
                  key={category.name}
                  to={`/search?taskType=${category.name.toLowerCase()}`}
                  className="group p-5 bg-white rounded-xl border border-[#5e7da5]/10 hover:border-[#005bc4]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-[#1a1a1a]">{category.name}</span>
                  </div>
                  <p className="text-sm text-[#575f72]">{category.description}</p>
                  {stats && (
                    <span className="text-xs text-[#575f72] mt-2 block">{stats.count} 个问题</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
