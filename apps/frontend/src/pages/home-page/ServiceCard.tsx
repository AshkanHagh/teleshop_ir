import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"
import { ChevronRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'

type ServiceCardProps = {
    title: string
    description: string
    route: string
}

function ServiceCard({ title, description, route }: ServiceCardProps) {
    return (
        <motion.div
            dragConstraints={{ left: -2, right: 2, top: -2, bottom: 2 }}
            drag
            transition={{
                type: 'string',
                bounceStiffness: 500,
                bounceDamping: 500
            }}
            whileTap={{ cursor: "grabbing" }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                    <div className="flex items-center mb-3">
                        <Star className="size-[1.40rem] text-blue-500 mr-2 flex-shrink-0 animate-pulse" />
                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-1 mr-2">{title}</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-3">{description}</p>
                </div>
                <Link
                    to={`options/${route}`}
                    className="inline-flex items-center justify-between w-full"
                >
                    <Button className="text-sm w-full max-w-sm flex items-center justify-between group px-4 py-2">
                        <span>اطلاعات بیشتر</span>
                        <ChevronRight className="size-5 transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    )
}

export default ServiceCard