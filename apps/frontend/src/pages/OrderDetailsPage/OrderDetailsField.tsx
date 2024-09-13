type OrderDetailsFieldProp = {
    name: string
    children: React.ReactNode
    className?: string
    filedNameClass?: string
}

const OrderDetailsField = ({ name, children, className, filedNameClass }: OrderDetailsFieldProp) => {
    return (
        <p className={className}><strong className={filedNameClass}>{name}: </strong>{children}</p>
    )
}

export default OrderDetailsField