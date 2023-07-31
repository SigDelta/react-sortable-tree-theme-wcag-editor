import { useEffect } from 'react'

function useOnOutsideClick(ref, callback) {
  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event)
        document.removeEventListener('click', handleClickOutside)
      }
    }

    const handleKeyboardEvent = event => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        callback(event)
        document.removeEventListener('keydown', handleKeyboardEvent)
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyboardEvent)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyboardEvent)
    }
  }, [ref, callback])
}

export default useOnOutsideClick
