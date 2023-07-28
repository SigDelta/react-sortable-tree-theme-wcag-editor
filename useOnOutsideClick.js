import { useEffect } from 'react'

function useOnOutsideClick(ref, callback) {
  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    const handleKeyboardEvent = event => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        callback()
      }
    }

    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keydown', handleKeyboardEvent)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('keydown', handleKeyboardEvent)
    }
  }, [ref, callback])
}

export default useOnOutsideClick
