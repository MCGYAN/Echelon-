import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedData, STORAGE_KEY } from "./seed";
import type {
  AppData,
  Booking,
  Course,
  Enrolment,
  Material,
  Module,
  Quiz,
  Session,
  SessionType,
  User,
} from "./types";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    /* ignore */
  }
  return createSeedData();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type Store = {
  data: AppData;
  currentUser: User | null;
  resetDemo: () => void;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  signup: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string };
  enrol: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getEnrolment: (courseId: string, userId?: string) => Enrolment | undefined;
  bookSession: (sessionId: string) => { ok: true } | { ok: false; error: string };
  isBooked: (sessionId: string) => boolean;
  sessionSeatsLeft: (sessionId: string) => number;
  markModuleComplete: (courseId: string, moduleId: string) => void;
  saveQuizScore: (courseId: string, quizId: string, scorePct: number) => void;
  courseProgress: (courseId: string, userId?: string) => number;
  addSession: (input: {
    title: string;
    type: SessionType;
    courseId: string | null;
    startsAt: string;
    durationMin: number;
    capacity: number;
    mode: Session["mode"];
  }) => void;
  addMaterial: (input: {
    courseId: string;
    title: string;
    minutes: number;
    body?: string;
    kind?: "notes" | "pdf";
    fileName?: string;
    fileDataUrl?: string;
  }) => void;
  addQuiz: (input: {
    courseId: string;
    title: string;
    prompt: string;
    options: string[];
    answerIndex: number;
  }) => void;
  updateCoursePrice: (courseId: string, priceGhs: number) => void;
  modulesForCourse: (courseId: string) => Module[];
  materialById: (id: string) => Material | undefined;
  quizById: (id: string) => Quiz | undefined;
  courseById: (id: string) => Course | undefined;
  bookingsForSession: (sessionId: string) => Booking[];
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  const persist = useCallback((next: AppData) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === data.currentUserId) ?? null,
    [data],
  );

  const value = useMemo<Store>(() => {
    const resetDemo = () => {
      const fresh = createSeedData();
      persist(fresh);
    };

    const login = (email: string, password: string) => {
      const user = data.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!user) return { ok: false as const, error: "Wrong email or password." };
      persist({ ...data, currentUserId: user.id });
      return { ok: true as const };
    };

    const logout = () => persist({ ...data, currentUserId: null });

    const signup = (name: string, email: string, password: string) => {
      if (data.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return { ok: false as const, error: "That email is already registered." };
      }
      const user: User = {
        id: uid("u"),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "student",
      };
      persist({
        ...data,
        users: [...data.users, user],
        currentUserId: user.id,
      });
      return { ok: true as const };
    };

    const getEnrolment = (courseId: string, userId = currentUser?.id) =>
      data.enrolments.find((e) => e.userId === userId && e.courseId === courseId);

    const isEnrolled = (courseId: string) => Boolean(getEnrolment(courseId));

    const enrol = (courseId: string) => {
      if (!currentUser || currentUser.role !== "student") return;
      if (isEnrolled(courseId)) return;
      const enrolment: Enrolment = {
        id: uid("e"),
        userId: currentUser.id,
        courseId,
        enrolledAt: new Date().toISOString(),
        completedModuleIds: [],
        quizScores: {},
      };
      persist({ ...data, enrolments: [...data.enrolments, enrolment] });
    };

    const bookingsForSession = (sessionId: string) =>
      data.bookings.filter((b) => b.sessionId === sessionId);

    const sessionSeatsLeft = (sessionId: string) => {
      const session = data.sessions.find((s) => s.id === sessionId);
      if (!session) return 0;
      return Math.max(0, session.capacity - bookingsForSession(sessionId).length);
    };

    const isBooked = (sessionId: string) =>
      Boolean(currentUser && data.bookings.some((b) => b.sessionId === sessionId && b.userId === currentUser.id));

    const bookSession = (sessionId: string) => {
      if (!currentUser) return { ok: false as const, error: "Sign in first." };
      if (isBooked(sessionId)) return { ok: false as const, error: "You already booked this one." };
      if (sessionSeatsLeft(sessionId) <= 0) return { ok: false as const, error: "This session is full." };
      const session = data.sessions.find((s) => s.id === sessionId);
      if (!session) return { ok: false as const, error: "Session not found." };
      if (session.type === "tutorial" && session.courseId && !isEnrolled(session.courseId)) {
        return {
          ok: false as const,
          error: "Enrol in the programme before booking this tutorial.",
        };
      }
      const booking: Booking = {
        id: uid("b"),
        sessionId,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      persist({ ...data, bookings: [...data.bookings, booking] });
      return { ok: true as const };
    };

    const markModuleComplete = (courseId: string, moduleId: string) => {
      if (!currentUser) return;
      const enrolment = getEnrolment(courseId);
      if (!enrolment) return;
      if (enrolment.completedModuleIds.includes(moduleId)) return;
      persist({
        ...data,
        enrolments: data.enrolments.map((e) =>
          e.id === enrolment.id
            ? { ...e, completedModuleIds: [...e.completedModuleIds, moduleId] }
            : e,
        ),
      });
    };

    const saveQuizScore = (courseId: string, quizId: string, scorePct: number) => {
      if (!currentUser) return;
      const enrolment = getEnrolment(courseId);
      if (!enrolment) return;
      persist({
        ...data,
        enrolments: data.enrolments.map((e) =>
          e.id === enrolment.id
            ? { ...e, quizScores: { ...e.quizScores, [quizId]: scorePct } }
            : e,
        ),
      });
    };

    const modulesForCourse = (courseId: string) =>
      data.modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);

    const courseProgress = (courseId: string, userId = currentUser?.id) => {
      const mods = modulesForCourse(courseId);
      if (!mods.length) return 0;
      const enrolment = getEnrolment(courseId, userId);
      if (!enrolment) return 0;
      return Math.round((enrolment.completedModuleIds.length / mods.length) * 100);
    };

    const addSession = (input: {
      title: string;
      type: SessionType;
      courseId: string | null;
      startsAt: string;
      durationMin: number;
      capacity: number;
      mode: Session["mode"];
    }) => {
      const session: Session = { id: uid("s"), ...input };
      persist({ ...data, sessions: [...data.sessions, session] });
    };

    const addMaterial = (input: {
      courseId: string;
      title: string;
      minutes: number;
      body?: string;
      kind?: "notes" | "pdf";
      fileName?: string;
      fileDataUrl?: string;
    }) => {
      const kind = input.kind ?? (input.fileDataUrl ? "pdf" : "notes");
      const material: Material = {
        id: uid("mat"),
        courseId: input.courseId,
        title: input.title,
        minutes: input.minutes,
        kind,
        body:
          kind === "pdf"
            ? []
            : (input.body ?? "")
                .split(/\n+/)
                .map((p) => p.trim())
                .filter(Boolean),
        fileName: input.fileName,
        fileDataUrl: input.fileDataUrl,
      };
      const order = modulesForCourse(input.courseId).length + 1;
      const module: Module = {
        id: uid("m"),
        courseId: input.courseId,
        order,
        title: input.title,
        summary:
          kind === "pdf"
            ? `PDF textbook: ${input.fileName ?? "document.pdf"}`
            : "Added from admin console.",
        materialId: material.id,
      };
      persist({
        ...data,
        materials: [...data.materials, material],
        modules: [...data.modules, module],
        courses: data.courses.map((c) =>
          c.id === input.courseId ? { ...c, moduleIds: [...c.moduleIds, module.id] } : c,
        ),
      });
    };

    const addQuiz = (input: {
      courseId: string;
      title: string;
      prompt: string;
      options: string[];
      answerIndex: number;
    }) => {
      const quiz: Quiz = {
        id: uid("q"),
        courseId: input.courseId,
        title: input.title,
        questions: [
          {
            id: uid("qq"),
            prompt: input.prompt,
            options: input.options,
            answerIndex: input.answerIndex,
          },
        ],
      };
      const mods = modulesForCourse(input.courseId);
      const last = mods[mods.length - 1];
      persist({
        ...data,
        quizzes: [...data.quizzes, quiz],
        modules: last
          ? data.modules.map((m) => (m.id === last.id ? { ...m, quizId: quiz.id } : m))
          : data.modules,
      });
    };

    const updateCoursePrice = (courseId: string, priceGhs: number) => {
      persist({
        ...data,
        courses: data.courses.map((c) => (c.id === courseId ? { ...c, priceGhs } : c)),
      });
    };

    return {
      data,
      currentUser,
      resetDemo,
      login,
      logout,
      signup,
      enrol,
      isEnrolled,
      getEnrolment,
      bookSession,
      isBooked,
      sessionSeatsLeft,
      markModuleComplete,
      saveQuizScore,
      courseProgress,
      addSession,
      addMaterial,
      addQuiz,
      updateCoursePrice,
      modulesForCourse,
      materialById: (id: string) => data.materials.find((m) => m.id === id),
      quizById: (id: string) => data.quizzes.find((q) => q.id === id),
      courseById: (id: string) => data.courses.find((c) => c.id === id),
      bookingsForSession,
    };
  }, [data, currentUser, persist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
