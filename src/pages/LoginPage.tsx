import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sendVerificationCode, verifyCode } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface FormData {
  email: string;
  code: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm<FormData>();

  const handleSendCode = async (email: string) => {
    setIsSending(true);
    setError(null);

    try {
      await sendVerificationCode(email);
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError('发送验证码失败，请检查邮箱地址');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmitEmail = async (data: FormData) => {
    await handleSendCode(data.email);
  };

  const onSubmitCode = async (data: FormData) => {
    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyCode(data.email, data.code);
      login(result.user);
      navigate('/');
    } catch (err) {
      setError('验证码错误或已过期');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#005bc4] to-[#695781] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">AS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">欢迎回来</h1>
          <p className="text-[#575f72] mt-2">登录 Agent Solve Hub</p>
        </div>

        <div className="bg-white rounded-xl border border-[#5e7da5]/10 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
              <Input
                label="邮箱地址"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email', {
                  required: '请输入邮箱地址',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址',
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSending}
              >
                {isSending ? '发送中...' : '发送验证码'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitCode)} className="space-y-4">
              <div className="p-4 bg-[#fafafa] rounded-lg">
                <div className="text-sm text-[#575f72] mb-1">验证码已发送至</div>
                <div className="font-medium text-[#1a1a1a]">{getValues('email')}</div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-[#005bc4] hover:underline mt-1"
                >
                  修改邮箱
                </button>
              </div>

              <Input
                label="验证码"
                placeholder="请输入 6 位验证码"
                maxLength={6}
                error={errors.code?.message}
                {...register('code', {
                  required: '请输入验证码',
                  pattern: {
                    value: /^\d{6}$/,
                    message: '验证码为 6 位数字',
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? '验证中...' : '验证并登录'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <span className="text-sm text-[#575f72]">
                    {countdown} 秒后可重新发送
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendCode(getValues('email'))}
                    className="text-sm text-[#005bc4] hover:underline"
                  >
                    重新发送验证码
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#575f72] mt-6">
          还没有账号？
          <Link to="/login" className="text-[#005bc4] hover:underline ml-1">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
