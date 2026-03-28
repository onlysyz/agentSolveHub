export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  role: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface Problem {
  id: string;
  title: string;
  summary: string | null;
  goal: string;
  platformName: string;
  taskType: string;
  osType: string | null;
  softwareVersion: string | null;
  language: string | null;
  errorMessage: string | null;
  attemptedSteps: string | null;
  status: 'pending' | 'available' | 'solved' | 'verified';
  verificationStatus: 'unverified' | 'community_verified' | 'verified' | 'multi_verified' | 'possibly_invalid';
  viewCount: number;
  createdById: string;
  createdBy: Pick<User, 'id' | 'nickname' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
  solutions?: Solution[];
  _count?: {
    solutions: number;
    feedback: number;
  };
}

export interface Solution {
  id: string;
  problemId: string;
  title: string;
  applicableEnvironment: string | null;
  rootCause: string | null;
  steps: string;
  alternativePaths: string | null;
  verificationMethod: string | null;
  invalidConditions: string | null;
  notes: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  verificationCount: number;
  createdById: string;
  createdBy: Pick<User, 'id' | 'nickname' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
  problem?: Pick<Problem, 'id' | 'title' | 'platformName'>;
  feedback?: Feedback[];
  _count?: {
    feedback: number;
    verifications: number;
  };
}

export interface Feedback {
  id: string;
  problemId: string | null;
  solutionId: string | null;
  userId: string;
  user: Pick<User, 'id' | 'nickname' | 'avatar'>;
  resultType: 'effective' | 'partial' | 'ineffective';
  environmentNote: string | null;
  comment: string | null;
  createdAt: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
}

export type View = 'home' | 'detail' | 'submit' | 'search' | 'profile';
