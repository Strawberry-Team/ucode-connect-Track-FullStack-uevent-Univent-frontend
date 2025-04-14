// lib/useEventsStore.ts
import { create } from "zustand";
import { getEvents, Event } from "@/lib/event";
import { showErrorToasts } from "@/lib/toast";

interface EventsState {
    events: Event[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchEvents: () => Promise<void>;
    refreshEvents: () => Promise<void>;
}

export const useEventsStore = create<EventsState>((set) => ({
    events: [],
    isLoading: true,
    lastFetched: null,

    fetchEvents: async () => {
        set({ isLoading: true });
        const result = await getEvents();

        if (result.success && result.data) {
            set({ events: result.data, lastFetched: Date.now() });
        } else {
            showErrorToasts(result.errors);
        }
        set({ isLoading: false });
    },

    refreshEvents: async () => {
        set({ isLoading: true });
        const result = await getEvents();

        if (result.success && result.data) {
            set({ events: result.data, lastFetched: Date.now() });
        } else {
            showErrorToasts(result.errors);
        }
        set({ isLoading: false });
    },
}));