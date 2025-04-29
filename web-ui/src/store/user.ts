import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    token: string
    userId: string,
    setToken: (token: string) => void
}

const useUserStore = create<UserState>()(persist((set) => ({
    token: import.meta.env.VITE_API_KEY,
    userId: import.meta.env.VITE_USER_ID,
    setToken: (token: string) => set({ token: token })
}),
    {
        name: 'user-storage',
    },
));


export default useUserStore;