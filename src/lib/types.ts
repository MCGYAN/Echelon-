export type Role = "student" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  level: string;
  priceGhs: number;
  blurb: string;
  audience: string;
  outcomes: string[];
  moduleIds: string[];
};

export type Module = {
  id: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  materialId: string;
  quizId?: string;
};

export type Material = {
  id: string;
  courseId: string;
  title: string;
  minutes: number;
  body: string[];
  kind: "notes" | "pdf";
  fileName?: string;
  fileDataUrl?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type Quiz = {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
};

export type SessionType = "tutorial" | "call";

export type Session = {
  id: string;
  title: string;
  type: SessionType;
  courseId: string | null;
  startsAt: string;
  durationMin: number;
  capacity: number;
  mode: "Online" | "Accra campus";
  notes?: string;
};

export type Enrolment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedModuleIds: string[];
  quizScores: Record<string, number>;
};

export type Booking = {
  id: string;
  sessionId: string;
  userId: string;
  createdAt: string;
};

export type AppData = {
  users: User[];
  courses: Course[];
  modules: Module[];
  materials: Material[];
  quizzes: Quiz[];
  sessions: Session[];
  enrolments: Enrolment[];
  bookings: Booking[];
  currentUserId: string | null;
};
