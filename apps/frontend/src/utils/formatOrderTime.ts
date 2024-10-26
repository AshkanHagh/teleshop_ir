import { format } from "date-fns-jalali"
import { faIR } from "date-fns/locale"

const formatOrderTime = (date: string) => {
    const orderDate = new Date(date)
    const now = new Date()
    const diffInDays = Math.round((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
        return `${format(date, 'h:mm a', { locale: faIR })} امروز`
    } else if (diffInDays === 1) {
        return `${format(date, 'h:mm a', { locale: faIR })} دیروز`
    } else {
        return `${format(date, 'h:mm a - yyyy/MM/dd', { locale: faIR })}`
    }
}

export default formatOrderTime