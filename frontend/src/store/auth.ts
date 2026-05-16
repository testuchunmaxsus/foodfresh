import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  access: string | null;
  refresh: string | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      setTokens: (access, refresh) => set({ access, refresh }),
      logout: () => {
        set({ access: null, refresh: null });
        window.location.href = "/login";
      },
    }),
    { name: "freshfood-auth" }
  )
);
