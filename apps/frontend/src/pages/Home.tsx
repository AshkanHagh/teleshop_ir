import ProductCard from "../components/ui/ProductCard"
import MenuWrapper from "../components/menu/MenuWrapper"
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton"
import LoadingScreen from "../components/LoadingScreen/LoadingScreen"

const options: { id: string, title: string, description: string }[] = [
    {
        id: '1',
        title: 'اکانت پرمیوم تلگرام',
        description: 'ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.'
    },
    {
        id: '2',
        title: 'رفرال ایردراپ',
        description: "افزایش سریع تعداد رفرال های ایردراپ ها مثل همستر, تب سواپ و غیره..."
    },
    {
        id: '3',
        title: "خرید استارس تلگرام",
        description: "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها."
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
                    Array(options.length).fill('').map((_, key) => (
                        <ProductCardSkeleton key={key} />
                    ))
                    :
                    <>
                        {options.map(card => (
                            <ProductCard
                                key={card.id}
                                id={card.id}
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