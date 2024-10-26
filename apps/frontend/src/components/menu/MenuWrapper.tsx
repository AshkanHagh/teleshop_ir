import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import MenuItem from './MenuItem'
import { motion, AnimatePresence } from 'framer-motion'
import usePermission from '../../hook/usePermission'
import { useLocation } from 'react-router-dom'

const menuVariants = {
    hidden: {
        opacity: 0,
        scale: 0.40,
        transition: {
            duration: 0.2,
            ease: 'easeInOut'
        },
        originY: 0,
        originX: -0.1
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeInOut'
        }
    }
}

const MenuWrapper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuWrapperRef = useRef<HTMLDivElement>(null)
    const menuIconRef = useRef<SVGSVGElement>(null)
    const location = useLocation()

    const handleClickOutside = useCallback((event: MouseEvent) => {
        const isClickOutside =
            !menuWrapperRef.current?.contains(event.target as Node) &&
            !menuIconRef.current?.contains(event.target as Node);

        if (isClickOutside) {
            setIsOpen(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, handleClickOutside])

    const handleMenuClick = () => {
        setIsOpen(prev => !prev)
    }

    const isAdmin = usePermission('admin')
    const isHomePage = location.pathname === '/'

    return (
        <div className="relative">
            <button
                onClick={handleMenuClick}
                className="flex items-center rounded text-gray-700 mt-1 focus:outline-none"
                aria-expanded={isOpen}
            >
                <Menu ref={menuIconRef} className="size-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuWrapperRef}
                        className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-2xl py-1 z-20 max-h-72 overflow-y-auto"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={menuVariants}
                    >
                        <h1 className="px-4 py-2 text-sm text-gray-700 font-bold border-b border-gray-200">داشبورد</h1>
                        <div onClick={() => setIsOpen(false)}>
                            {isAdmin && <MenuItem to='/admin/manage-orders' variant='admin-panel' text='مدیریت سفارش ها' />}
                            {!isHomePage && <MenuItem to='/' variant='services' text='سرویس ها' />}
                            <MenuItem to='/order-history' variant='history' text='سفارشات' />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MenuWrapper