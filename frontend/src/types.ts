/**
 * 全局类型定义
 * Global type definitions
 */

// ==================== 用户类型 ====================
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== 认证类型 ====================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ==================== 课程类型 ====================
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// ==================== AI助教类型 ====================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIChatRequest {
  message: string;
  course_id: string;
  conversation_history?: ChatMessage[];
}

export interface AIChatResponse {
  response: string;
  conversation_history: ChatMessage[];
}

// ==================== 学习分析类型 ====================
export interface LearningProgress {
  user_id: string;
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  quiz_scores: number[];
  average_score: number;
  time_spent_minutes: number;
  last_accessed: string;
}

export interface LearningAnalytics {
  total_courses: number;
  completed_courses: number;
  total_learning_time: number;
  average_score: number;
  learning_streak: number;
  progress_by_course: LearningProgress[];
}

// ==================== 推荐类型 ====================
export interface Recommendation {
  id: string;
  type: 'course' | 'lesson' | 'resource';
  title: string;
  description: string;
  reason: string;
  confidence_score: number;
  thumbnail_url?: string;
}

// ==================== 视频会议类型 ====================
export interface VideoRoom {
  id: string;
  name: string;
  participant_count: number;
  max_participants: number;
  created_at: string;
}

export interface JoinRoomRequest {
  room_name: string;
  participant_name: string;
  metadata?: string;
}

export interface JoinRoomResponse {
  token: string;
  url: string;
  room_name: string;
  participant_name: string;
}

// ==================== 知识图谱类型 ====================
export interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight?: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

// ==================== API响应类型 ====================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== 通知类型 ====================
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ==================== 作业类型 ====================
export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_urls?: string[];
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}
