import { ReactNode } from "react"

type MainLayoutProps = {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="p-4 py-3 max-w-md mx-auto">  
            {children}
        </div>
    )
}

export default MainLayout