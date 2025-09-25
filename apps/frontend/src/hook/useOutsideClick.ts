import { MutableRefObject, useEffect } from "react"

const useOutsideClick = (
  enabled: boolean,
  elementRef: MutableRefObject<any | null>,
  cb: () => void
) => {
  useEffect(() => {
    if (!enabled) return

    const element = elementRef.current
    if (!element) return

    const handle = (e: any) => {
      if (!element?.contains(e.target)) {
        cb()
      }
    }

    document.addEventListener("click", handle)

    return () => {
      document.removeEventListener("click", handle)
    }
  }, [elementRef, cb])
}

export default useOutsideClick
