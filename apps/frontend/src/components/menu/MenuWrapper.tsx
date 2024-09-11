import { useState } from 'react'
import { Menu } from 'lucide-react'
import MenuItem from './MenuItem'

const MenuWrapper = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="relative">
            <button
                onClick={toggleMenu}
                className="flex items-center rounded text-gray-70 mt-1"
                aria-expanded={isOpen}
            >
                <Menu className="size-[1.60rem]" />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-2xl py-1 z-10 max-h-72 overflow-y-auto">
                    <h1 className="px-4 py-2 text-sm text-gray-700 font-bold border-b border-gray-200">پنل کاربری</h1>
                    <MenuItem variant='history' text='سابقه' />
                    <MenuItem variant='admin-panel' text='پنل مدیریت' />
                </div>
            )}
        </div>
    )
}

export default MenuWrapper