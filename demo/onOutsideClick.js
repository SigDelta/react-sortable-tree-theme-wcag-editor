import { useEffect } from 'react'

function useOnOutsideClick(element, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (element && !element.contains(event.target)) {
        callback(event)
        document.removeEventListener('click', handleClickOutside)
      }
    }

    const handleKeyboardEvent = (event) => {
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
  }, [element, callback])
}

export default useOnOutsideClick
