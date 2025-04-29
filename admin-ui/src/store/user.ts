import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    user: 'admin' | "driver" | "owner"
    setUser: (token: 'admin' | "driver" | "owner") => void
}

const useUserStore = create<UserState>()(persist((set) => ({
    user: "admin",
    setUser: (token: 'admin' | "driver" | "owner") => set({ user: token })
}),
    {
        name: 'user-storage',
    },
));


export default useUserStore;