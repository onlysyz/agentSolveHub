import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { createSolution, getSolution } from '../services/solutions';
import { getProblem } from '../services/problems';
import { useAuth } from '../context/AuthContext';
import type { Problem, Solution } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';

interface Step {
  title: string;
  description: string;
  notes?: string;
}

interface FormData {
  title: string;
  rootCause: string;
  steps: Step[];
  alternativePaths: { title: string; description: string }[];
  verificationMethod: string;
  invalidConditions: string;
  notes: string;
}

export function SubmitSolutionPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      steps: [{ title: '', description: '', notes: '' }],
      alternativePaths: [],
    },
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

  const { fields: altFields, append: appendAlt, remove: removeAlt } = useFieldArray({
    control,
    name: 'alternativePaths',
  });

  useEffect(() => {
    async function fetchProblem() {
      if (!problemId) return;
      try {
        const data = await getProblem(problemId);
        setProblem(data);
      } catch (err) {
        console.error('Failed to fetch problem:', err);
      }
    }
    fetchProblem();
  }, [problemId]);

  const onSubmit = async (data: FormData) => {
    if (!isLoggedIn || !user || !problemId) {
      setError('请先登录');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createSolution({
        problemId,
        title: data.title,
        rootCause: data.rootCause,
        steps: data.steps.filter(s => s.title && s.description),
        alternativePaths: data.alternativePaths.filter(a => a.title && a.description),
        verificationMethod: data.verificationMethod,
        invalidConditions: data.invalidConditions,
        notes: data.notes,
        createdById: user.id,
      });
      navigate(`/problems/${problemId}`);
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
          <p className="text-[#575f72] mb-6">登录后才能提交解法</p>
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-[#575f72] hover:text-[#005bc4] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">提交解法</h1>

          {problem && (
            <div className="p-4 bg-white rounded-xl border border-[#5e7da5]/10 mb-4">
              <div className="text-sm text-[#575f72] mb-1">正在为以下问题提供解法</div>
              <div className="font-medium text-[#1a1a1a]">{problem.title}</div>
              <div className="text-sm text-[#575f72] mt-1">
                {problem.platformName} · {problem.taskType}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            请仅提交你亲自验证过或明确适用条件的解法。如果仅在特定版本有效，请务必写明环境。
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-[#5e7da5]/10 p-6 space-y-6">
          <Input
            label="解法标题 *"
            placeholder="简洁描述这个解法"
            error={errors.title?.message}
            {...register('title', { required: '请输入解法标题' })}
          />

          <Textarea
            label="问题根因判断"
            placeholder="用 1~3 句话说明为什么出现该问题"
            rows={2}
            {...register('rootCause')}
          />

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#575f72]">
                解决步骤 *
              </label>
              <button
                type="button"
                onClick={() => appendStep({ title: '', description: '', notes: '' })}
                className="flex items-center gap-1 text-sm text-[#005bc4] hover:text-[#004a9f]"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            </div>

            <div className="space-y-4">
              {stepFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-[#fafafa] rounded-lg border border-[#5e7da5]/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1a1a1a]">步骤 {index + 1}</span>
                    {stepFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="步骤标题"
                      {...register(`steps.${index}.title` as const, { required: '请输入步骤标题' })}
                    />
                    <Textarea
                      placeholder="详细说明"
                      rows={2}
                      {...register(`steps.${index}.description` as const, { required: '请输入详细说明' })}
                    />
                    <Input
                      placeholder="注意事项（可选）"
                      {...register(`steps.${index}.notes` as const)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Paths */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#575f72]">
                替代路径（可选）
              </label>
              <button
                type="button"
                onClick={() => appendAlt({ title: '', description: '' })}
                className="flex items-center gap-1 text-sm text-[#005bc4] hover:text-[#004a9f]"
              >
                <Plus className="w-4 h-4" />
                添加替代路径
              </button>
            </div>

            <div className="space-y-4">
              {altFields.map((field, index) => (
                <div key={field.id} className="p-4 bg-[#fafafa] rounded-lg border border-[#5e7da5]/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1a1a1a]">替代方案 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAlt(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="方案标题"
                      {...register(`alternativePaths.${index}.title` as const)}
                    />
                    <Textarea
                      placeholder="详细说明"
                      rows={2}
                      {...register(`alternativePaths.${index}.description` as const)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="如何验证成功"
            placeholder="描述确认问题已解决的方法"
            rows={2}
            {...register('verificationMethod')}
          />

          <Textarea
            label="已知失效场景"
            placeholder="在哪些情况下可能无效？"
            rows={2}
            {...register('invalidConditions')}
          />

          <Textarea
            label="补充说明"
            placeholder="相关脚本、prompt、示例代码等"
            rows={3}
            {...register('notes')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交解法'}
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
