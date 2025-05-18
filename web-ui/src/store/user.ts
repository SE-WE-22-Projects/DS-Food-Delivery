import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserDetails = {
    id: string,
    name: string,
    email: string,
    profile_image?: string
    roles: string[]
}


type UserState = {
    setUser: (token: string, details: UserDetails) => void,
    clear: () => void
} & ({
    user: undefined
    token: undefined
    userId: undefined,
    loggedIn: false,
} | {
    user: UserDetails,
    token: string
    userId: string,
    loggedIn: true,
})

const useUserStore = create<UserState>()(persist((set) => ({
    userId: undefined,
    user: undefined,
    token: undefined,
    loggedIn: false,
    setUser: (token: string, details: UserDetails) => set({ token: token, loggedIn: true, user: details, userId: details.id }),
    clear: () => set({ userId: undefined, user: undefined, token: undefined, loggedIn: false })
}),
    {
        name: 'user-storage',
    },
));


export default useUserStore;