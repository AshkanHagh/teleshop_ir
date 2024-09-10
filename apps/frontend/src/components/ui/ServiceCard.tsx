import { Link } from "react-router-dom";
import Button from "./Button";

type ServiceCardProps = {
    title: string
    description: string
    nextRoute: string
}

function ServiceCard({ title, description, nextRoute }: ServiceCardProps) {

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between h-full">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <Link to={`options/${nextRoute}`}><Button className="text-sm" text="اطلاعات بیشتر" /></Link>
            </div>
        </>
    )
}

export default ServiceCard