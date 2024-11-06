import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { HandleSelectChange, SelectOption } from '../../types/types'

type SelectProps = {
    options: SelectOption[],
    handleChange: HandleSelectChange
}

const Select: React.FC<SelectProps> = ({ options, handleChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<SelectOption>(
        options.find(option => option.isInitValue === true) ?? options[0]
    )

    const stopChangeOption = (): 'stop' => 'stop'

    const handleChangeOption = (newOption: SelectOption) => {
        if (newOption.value !== selectedOption.value) {
            const result = handleChange(newOption, stopChangeOption)
            
            if (result !== 'stop') setSelectedOption(newOption)
        }
        setIsOpen(false)
    }

    return (
        <div className="mb-4 relative">
            <motion.div
                aria-expanded={isOpen}
                aria-controls="dropdown-list"
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex justify-between items-center">
                    <span>{selectedOption?.label}</span>
                    <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        id="dropdown-list"
                        className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {options.map((option) => (
                            <motion.li
                                key={option.value}
                                className="p-2 cursor-pointer"
                                onClick={() => handleChangeOption(option)}
                                whileTap={{ scale: 0.98 }}
                            >
                                {option.label}
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Select
