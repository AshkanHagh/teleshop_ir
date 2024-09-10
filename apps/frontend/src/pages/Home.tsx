import ServiceCard from "../components/ui/ServiceCard"
import MenuWrapper from "../components/menu/MenuWrapper"
import ServiceCardSkeleton from "../components/ui/ServiceCardSkeleton"
import LoadingScreen from "../components/LoadingScreen/LoadingScreen"

const options: { id: string, title: string, description: string, nextRoute: string }[] = [
    {
        id: '1',
        title: 'اکانت پرمیوم تلگرام',
        description: 'ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.',
        nextRoute: `tg-Premium/${1}`
    },
    {
        id: '2',
        title: 'رفرال ایردراپ',
        description: "افزایش سریع تعداد رفرال های ایردراپ ها مثل همستر, تب سواپ و غیره...",
        nextRoute: `fake-Referral/${2}`
    },
    {
        id: '3',
        title: "خرید استارس تلگرام",
        description: "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
        nextRoute: `stars/${3}`
    },

]

const Home = () => {

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800 ">محصولات</h1>
                <MenuWrapper />
            </div>
            <div className="grid grid-cols-1 gap-4">
                {false
                    ?
                    [1, 2, 3].map((key) => (
                        <ServiceCardSkeleton key={key} />
                    ))
                    :
                    <>
                        {options.map(card => (
                            <ServiceCard
                                key={card.id}
                                nextRoute={card.nextRoute}
                                title={card.title}
                                description={card.description}
                            />
                        ))}
                    </>
                }
            </div>
            {false && <LoadingScreen />}
        </div>
    )
}

export default Home