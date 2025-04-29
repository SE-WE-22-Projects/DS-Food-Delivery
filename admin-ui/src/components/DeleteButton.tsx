import React from 'react'
import { Button } from './ui/button'

const DeleteButton = ({ children, action }: { children: React.ReactNode, action: () => void }) => {
    return (
        <Button className={`
                w-full 
                bg-red-500
                font-semibold
                border-none 
                shadow-lg 
                hover:shadow-xl hover:shadow-red-500/50
                hover:brightness-110 
                hover:scale-[1.03]
                hover:bg-red-500
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                active:scale-[0.97] 
                active:brightness-95 
                transition-all duration-300 ease-in-out 
                flex items-center justify-center gap-2 
                `}
                onClick={(e)=>{
                    e.preventDefault();
                    e.stopPropagation();
                    action()
                }}
                >
            {children
            }
        </Button>
    )
}

export default DeleteButton