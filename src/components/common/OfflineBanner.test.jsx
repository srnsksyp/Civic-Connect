// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import OfflineBanner from './OfflineBanner'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockTranslations = {
  offlineStatus: 'You are offline',
  offlineMessage: 'Check your internet connection and try again.',
}

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => mockTranslations[key] || key,
  }),
}))

describe('OfflineBanner Component', () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
    root = null
    vi.restoreAllMocks()
  })

  it('renders nothing when navigator.onLine is true initially', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    act(() => {
      root.render(<OfflineBanner />)
    })

    expect(container.innerHTML).toBe('')
    expect(container.querySelector('[role="status"]')).toBeNull()
  })

  it('renders the banner immediately when navigator.onLine is false initially', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    act(() => {
      root.render(<OfflineBanner />)
    })

    const banner = container.querySelector('[role="status"]')
    expect(banner).not.toBeNull()
    expect(banner.getAttribute('aria-live')).toBe('polite')
    expect(banner.getAttribute('aria-label')).toBe(mockTranslations.offlineStatus)
    expect(banner.textContent).toContain(mockTranslations.offlineMessage)
    expect(banner.querySelector('svg')).not.toBeNull()
  })

  it('displays the banner when window dispatches an offline event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    act(() => {
      root.render(<OfflineBanner />)
    })

    expect(container.innerHTML).toBe('')

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    const banner = container.querySelector('[role="status"]')
    expect(banner).not.toBeNull()
    expect(banner.getAttribute('aria-live')).toBe('polite')
    expect(banner.getAttribute('aria-label')).toBe(mockTranslations.offlineStatus)
    expect(banner.textContent).toContain(mockTranslations.offlineMessage)
  })

  it('hides the banner when window dispatches an online event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    act(() => {
      root.render(<OfflineBanner />)
    })

    expect(container.querySelector('[role="status"]')).not.toBeNull()

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(container.innerHTML).toBe('')
    expect(container.querySelector('[role="status"]')).toBeNull()
  })

  it('registers window online and offline event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    act(() => {
      root.render(<OfflineBanner />)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('removes window online and offline event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    act(() => {
      root.render(<OfflineBanner />)
    })

    act(() => {
      root.unmount()
    })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('handles multiple repeated online and offline transitions smoothly', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    act(() => {
      root.render(<OfflineBanner />)
    })
    expect(container.querySelector('[role="status"]')).toBeNull()

    // 1. Transition to offline
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(container.querySelector('[role="status"]')).not.toBeNull()

    // 2. Transition back to online
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(container.querySelector('[role="status"]')).toBeNull()

    // 3. Transition to offline again
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(container.querySelector('[role="status"]')).not.toBeNull()
    expect(container.textContent).toContain(mockTranslations.offlineMessage)

    // 4. Transition back to online again
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(container.querySelector('[role="status"]')).toBeNull()
  })
})
