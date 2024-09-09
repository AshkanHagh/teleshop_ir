import { History, ShieldAlert } from 'lucide-react'

type MenuItemVariant = 'admin-panel' | 'history'

type MenuItemProps = {
    variant: MenuItemVariant,
    text: string
}

const MenuItem: React.FC<MenuItemProps> = ({ variant, text }) => {

    const checkVariant = (variant: MenuItemVariant) => {
        switch (variant) {
            case 'admin-panel':
                return <ShieldAlert size='17' />
            case 'history':
                return <History size='17' />
        }
    }

    return (
        <a
            href="#"
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
            {checkVariant(variant)}
            <span className='mr-1 mb-1'>{text}</span>
        </a>
    )
}

export default MenuItem