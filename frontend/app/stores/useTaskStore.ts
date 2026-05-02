import { create } from "zustand";
import { apiFetch } from "../services/apiClient";

export type Task = {
  _id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (payload: Pick<Task, "title">) => Promise<Task | null>;
  updateTask: (id: string, patch: Partial<Pick<Task, "title" | "completed">>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
};

const TASKS_PATH = "/api/tasks";

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch<ApiListResponse<Task[]>>(TASKS_PATH);
      set({ tasks: response.data ?? [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error cargando tareas" });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch<ApiListResponse<Task>>(TASKS_PATH, {
        method: "POST",
        json: payload,
      });
      const created = response.data;
      set({ tasks: [created, ...get().tasks] });
      return created;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error creando tarea" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, patch) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch<ApiListResponse<Task>>(`${TASKS_PATH}/${id}`, {
        method: "PUT",
        json: patch,
      });
      const updated = response.data;
      set({
        tasks: get().tasks.map((t) => (t._id === id ? updated : t)),
      });
      return updated;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error actualizando tarea" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch<ApiListResponse<unknown>>(`${TASKS_PATH}/${id}`, {
        method: "DELETE",
      });
      set({ tasks: get().tasks.filter((t) => t._id !== id) });
      return true;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error eliminando tarea" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
