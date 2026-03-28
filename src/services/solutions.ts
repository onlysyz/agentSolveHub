import { apiRequest } from './api';
import type { Solution, ApiResponse, Pagination } from '../types';

export interface GetSolutionsParams {
  problemId?: string;
  page?: number;
  limit?: number;
}

export async function getSolutions(params: GetSolutionsParams = {}): Promise<{ data: Solution[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams();

  if (params.problemId) searchParams.set('problemId', params.problemId);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return apiRequest<{ data: Solution[]; pagination: Pagination }>(`/solutions${query ? `?${query}` : ''}`);
}

export async function getSolution(id: string): Promise<Solution> {
  return apiRequest<Solution>(`/solutions/${id}`);
}

export async function createSolution(data: {
  problemId: string;
  title: string;
  applicableEnvironment?: object;
  rootCause?: string;
  steps: Array<{ title: string; description: string; notes?: string }>;
  alternativePaths?: Array<{ title: string; description: string }>;
  verificationMethod?: string;
  invalidConditions?: string;
  notes?: string;
  createdById: string;
}): Promise<Solution> {
  return apiRequest<Solution>('/solutions', {
    method: 'POST',
    body: data,
  });
}

export async function updateSolution(id: string, data: Partial<Solution>): Promise<Solution> {
  return apiRequest<Solution>(`/solutions/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteSolution(id: string): Promise<void> {
  return apiRequest<void>(`/solutions/${id}`, { method: 'DELETE' });
}
