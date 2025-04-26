import React from 'react'


interface DynamicModalData {
    title: string;
    description?: string;
    children: React.ReactNode | React.ReactNode[];
    actionName?: string;
    open: boolean
    setOpen: (open: boolean) => void;
    action: () => void;
}

const DynamicModal: React.FC<DynamicModalData> = ({ title, description, children, open, setOpen, action, actionName="Yes" }) => {
    const handleOnClose = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.id === 'container') setOpen(false);
    };
    if (!open) return null;

    return (
        <div
            id='container'
            onClick={handleOnClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-xs flex justify-center items-center"
        >

            <div className="bg-background p-6 rounded-3xl shadow-xl min-w-fit">
                <div className='flex flex-col mb-2'>
                    <h1 className='text-2xl'>{title}</h1>
                    {description && (
                        <p>{description}</p>
                    )}
                </div>
                {children}
                <div className="flex justify-center space-x-4 my-5">
                    <button
                        onClick={action}
                        className="bg-transparent border-2 border-main text-main px-6 py-2 rounded-full hover:bg-teal-500"
                    >
                        {actionName}
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="bg-transparent border-2 border-main text-main px-6 py-2 rounded-full hover:bg-red-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DynamicModal