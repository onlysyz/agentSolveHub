import { apiRequest } from './api';
import type { Problem, ApiResponse, Pagination } from '../types';

export interface GetProblemsParams {
  page?: number;
  limit?: number;
  platform?: string;
  taskType?: string;
  osType?: string;
  status?: string;
  verificationStatus?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function getProblems(params: GetProblemsParams = {}): Promise<{ data: Problem[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.platform) searchParams.set('platform', params.platform);
  if (params.taskType) searchParams.set('taskType', params.taskType);
  if (params.osType) searchParams.set('osType', params.osType);
  if (params.status) searchParams.set('status', params.status);
  if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);

  const query = searchParams.toString();
  return apiRequest<{ data: Problem[]; pagination: Pagination }>(`/problems${query ? `?${query}` : ''}`);
}

export async function getProblem(id: string): Promise<Problem> {
  return apiRequest<Problem>(`/problems/${id}`);
}

export async function createProblem(data: {
  title: string;
  summary?: string;
  goal: string;
  platformName: string;
  taskType: string;
  osType?: string;
  softwareVersion?: string;
  language?: string;
  errorMessage?: string;
  attemptedSteps?: string[];
  createdById: string;
}): Promise<Problem> {
  return apiRequest<Problem>('/problems', {
    method: 'POST',
    body: data,
  });
}

export async function updateProblem(id: string, data: Partial<Problem>): Promise<Problem> {
  return apiRequest<Problem>(`/problems/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteProblem(id: string): Promise<void> {
  return apiRequest<void>(`/problems/${id}`, { method: 'DELETE' });
}
