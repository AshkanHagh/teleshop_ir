type OrderDetailsFieldProp = {
    name: string
    children: React.ReactNode
    className?: string
    filedNameClass?: string
}

const OrderDetailsField = ({ name, children, className }: OrderDetailsFieldProp) => {
    return (
        <p className={className}><strong>{name}: </strong>{children}</p>
    )
}

export default OrderDetailsField