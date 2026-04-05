// store/email.ts
import { create } from "zustand";

interface EmailState {
    email: string | null;
    setEmail: (email: string | null) => void;
}

export const useEmailStore = create<EmailState>((set) => ({
    email: null,
    setEmail: (email) => set({ email }),
}));
