import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createProblem } from '../services/problems';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';

const PLATFORMS = ['Chrome', 'Notion', 'CapCut', 'Excel', 'Docker', 'Figma', 'Slack', 'Zoom', 'Other'];
const TASK_TYPES = ['upload', 'export', 'login', 'automation', 'api', 'settings', 'collaboration', 'other'];
const OS_TYPES = ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'iOS', 'Android', 'Other'];

interface FormData {
  title: string;
  goal: string;
  platformName: string;
  taskType: string;
  osType: string;
  softwareVersion: string;
  language: string;
  errorMessage: string;
  summary: string;
}

export function SubmitProblemPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!isLoggedIn || !user) {
      setError('请先登录');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const problem = await createProblem({
        ...data,
        createdById: user.id,
      });
      navigate(`/problems/${problem.id}`);
    } catch (err) {
      setError('提交失败，请重试');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-[#005bc4] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">请先登录</h2>
          <p className="text-[#575f72] mb-6">登录后才能提交问题</p>
          <Link to="/login">
            <Button>登录 / 注册</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">提交问题</h1>
          <p className="text-[#575f72]">
            描述越具体，越容易得到可复用的解法。建议写清楚任务目标、使用的软件、环境和卡住的位置。
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 space-y-6">
          <Input
            label="问题标题 *"
            placeholder="一句话描述你的问题"
            error={errors.title?.message}
            {...register('title', { required: '请输入问题标题' })}
          />

          <Textarea
            label="任务目标 *"
            placeholder="你想完成什么任务？"
            rows={2}
            error={errors.goal?.message}
            {...register('goal', { required: '请描述你的任务目标' })}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="软件/平台 *"
              options={[{ value: '', label: '选择软件平台' }, ...PLATFORMS.map(p => ({ value: p, label: p }))]}
              error={errors.platformName?.message}
              {...register('platformName', { required: '请选择软件平台' })}
            />

            <Select
              label="任务类型 *"
              options={[{ value: '', label: '选择任务类型' }, ...TASK_TYPES.map(t => ({ value: t, label: t }))]}
              error={errors.taskType?.message}
              {...register('taskType', { required: '请选择任务类型' })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="操作系统"
              options={[{ value: '', label: '选择操作系统' }, ...OS_TYPES.map(o => ({ value: o, label: o }))]}
              {...register('osType')}
            />

            <Input
              label="软件版本"
              placeholder="如: 120.0.6099.130"
              {...register('softwareVersion')}
            />
          </div>

          <Input
            label="界面语言"
            placeholder="如: zh-CN, en"
            {...register('language')}
          />

          <Textarea
            label="当前遇到的问题或报错"
            placeholder="描述你遇到的具体问题或错误信息"
            rows={3}
            {...register('errorMessage')}
          />

          <Textarea
            label="已尝试的步骤"
            placeholder="你已经尝试了哪些方法？"
            rows={2}
            {...register('summary')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交问题'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
