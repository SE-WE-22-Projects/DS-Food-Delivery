import { Link } from 'react-router-dom'

const Footer = () => {
    return <footer className="w-full border-t py-6 md:py-0 from-orange-500/90 via-orange-600/80 to-orange-500/90 bg-gradient-to-r text-white">
        <div className=" flex  items-center justify-between flex-row container mx-auto py-2">
            <p className="text-center text-md leading-loose md:text-left text-white/75 ">
                © 2025 QuickEats. All rights reserved.
            </p>
            <div className="flex gap-4">
                <Link to="#" className="text-sm font-medium">
                    Terms
                </Link>
                <Link to="#" className="text-sm font-medium">
                    Privacy
                </Link>
                <Link to="#" className="text-sm font-medium">
                    Cookies
                </Link>
            </div>
        </div>
    </footer>
}

export default Footer