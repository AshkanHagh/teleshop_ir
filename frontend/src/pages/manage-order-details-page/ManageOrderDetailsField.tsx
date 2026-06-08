type OrderDetailsFieldProp = {
  name: string
  children: React.ReactNode
  className?: string
  filedNameClass?: string
}

const ManageOrderDetailsField = ({
  name,
  children,
  className
}: OrderDetailsFieldProp) => {
  return (
    <p className={className}>
      <strong>{name}: </strong>
      {children}
    </p>
  )
}

export default ManageOrderDetailsField
