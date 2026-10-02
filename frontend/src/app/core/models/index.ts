export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';
export type QuestionType = 'MCQ' | 'TRUE_FALSE';
export type SummaryType = 'SHORT' | 'DETAILED' | 'KEY_POINTS' | 'EXAM_NOTES';
export type RecommendationType = 'NEXT_LESSON' | 'REVISION' | 'QUIZ' | 'COURSE' | 'STUDY_PATH';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenData {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  category: string;
  instructorId: string;
  instructorName: string;
  difficulty: CourseDifficulty;
  duration: string;
  language: string;
  prerequisites: string[];
  learningObjectives: string[];
  status: CourseStatus;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
  lessonCount?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  content: string;
  videoUrl: string;
  resources: string[];
  estimatedMinutes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string;
  questions?: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  maxAttempts: number;
}

export interface StudentQuiz extends Omit<Quiz, 'questions'> {
  questions: Array<Omit<QuizQuestion, 'correctAnswer' | 'explanation'>>;
  attemptsUsed: number;
  attemptsRemaining: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  answers: Record<string, string>;
  score: number;
  earnedMarks: number;
  totalMarks: number;
  passingScore: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    question: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    explanation: string;
    earnedMarks: number;
    totalMarks: number;
  }>;
  submittedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  status: EnrollmentStatus;
  progressPercentage: number;
  lastAccessedLessonId: string | null;
  course?: Course;
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  issuer: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateVerification {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  issuer: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  studentId: string;
  courseId: string | null;
  lessonId: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
