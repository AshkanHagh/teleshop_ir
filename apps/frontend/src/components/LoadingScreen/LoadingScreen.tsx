import style from './loadingScreen.module.css'

const LoadingScreen = () => {
  return (
    <div className='fixed inset-0 z-10 flex items-center justify-center bg-white'>
        <div className={style.loader}></div>
    </div>
  )
}

export default LoadingScreen