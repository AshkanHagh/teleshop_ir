import ServiceCard from "./ServiceCard"
import ServiceCardSkeleton from "./ServiceCardSkeleton"
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import Container from "../../components/layout/Container"

const options: {
    id: string
    title: string
    description: string
    route: string

}[] = [
        {
            id: '1',
            title: 'اکانت پرمیوم تلگرام',
            description: 'ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.',
            route: 'premium'
        },
        {
            id: '3',
            title: "خرید استارس تلگرام",
            description: "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
            route: 'stars'
        }
    ]

const Home = () => {
    return (
        <Container title="سرویس ها">
            <div className="grid grid-cols-1 gap-4">
                {false
                    ?
                    [1, 2, 3].map((key) => (
                        <ServiceCardSkeleton key={key} />
                    ))
                    : options.map(card => (
                        <ServiceCard
                            key={card.id}
                            route={card.route}
                            title={card.title}
                            description={card.description}
                        />
                    ))
                }
            </div>
            {false && <LoadingScreen />}
        </Container>
    )
}

export default Home