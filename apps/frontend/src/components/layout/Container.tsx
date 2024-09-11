import MenuWrapper from "../menu/MenuWrapper"

type ContainerProps = {
    children: React.ReactNode,
    title?: string
}

const Container: React.FC<ContainerProps> = ({ children, title = '' }) => {
    return (
        <div className="p-4 py-3 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <MenuWrapper />
            </div>
            {children}
        </div>
    )
}

export default Container