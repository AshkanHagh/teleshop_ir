import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import MenuItem from './MenuItem'

const MenuWrapper = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuWrapperRef = useRef<HTMLDivElement>(null)
    const menuIconRef = useRef<SVGSVGElement>(null)

    const handleClickOutside = useCallback( (event: MouseEvent) => {
        const isClickOutside = 
        !menuWrapperRef.current?.contains(event.target as Node) &&
        !menuIconRef.current?.contains(event.target as Node);
        
        if (isClickOutside) {
            setIsOpen(false)
        }
    }, [isOpen])

    useEffect(() => {

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleMenuClick = () => {
        setIsOpen(prev => !prev)
    }

    return (
        <div className="relative">
            <button
                onClick={handleMenuClick}
                className="flex items-center rounded text-gray-70 mt-1"
                aria-expanded={isOpen}
            >
                <Menu ref={menuIconRef} className="size-[1.60rem]" />
            </button>

            {isOpen && (
                <div ref={menuWrapperRef} className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-2xl py-1 z-10 max-h-72 overflow-y-auto">
                    <h1 className="px-4 py-2 text-sm text-gray-700 font-bold border-b border-gray-200">پنل کاربری</h1>
                    <div onClick={() => setIsOpen(false)}>
                        <MenuItem to='#' variant='history' text='سابقه' />
                        <MenuItem to='/orders' variant='admin-panel' text='مدیریت سفارش ها' />
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuWrapper
