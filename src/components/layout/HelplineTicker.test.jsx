// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import HelplineTicker, { HELPLINES } from './HelplineTicker'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('HelplineTicker Component', () => {
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
  })

  it('exports the standard HELPLINES configuration array correctly', () => {
    expect(Array.isArray(HELPLINES)).toBe(true)
    expect(HELPLINES.length).toBe(3)

    expect(HELPLINES).toEqual([
      { label: 'Emergency', number: '112', hours: '24x7' },
      { label: 'Disaster Helpline', number: '1070', hours: '24x7' },
      { label: 'Women Safety', number: '1091', hours: '24x7' },
    ])
  })

  it('renders a semantic region with the accessible name "Emergency helplines"', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    const region = container.querySelector('[role="region"]')
    expect(region).not.toBeNull()
    expect(region.getAttribute('aria-label')).toBe('Emergency helplines')
  })

  it('renders all helplines within a semantic <ul> list matching HELPLINES length', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    const list = container.querySelector('ul')
    expect(list).not.toBeNull()

    const items = list.querySelectorAll('li')
    expect(items.length).toBe(HELPLINES.length)
  })

  it('renders functional telephone links (tel:...) for every helpline entry', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    HELPLINES.forEach(({ number }) => {
      const link = container.querySelector(`a[href="tel:${number}"]`)
      expect(link).not.toBeNull()
      expect(link.tagName.toLowerCase()).toBe('a')
    })
  })

  it('provides descriptive accessible labels for every telephone link', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    HELPLINES.forEach(({ label, number, hours }) => {
      const link = container.querySelector(`a[href="tel:${number}"]`)
      const expectedAriaLabel = `Call ${label} on ${number}, available ${hours}`
      expect(link.getAttribute('aria-label')).toBe(expectedAriaLabel)
    })
  })

  it('renders decorative phone icons with aria-hidden="true"', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(HELPLINES.length)

    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    })
  })

  it('renders complete visible text including label, number, and hours for each helpline', () => {
    act(() => {
      root.render(<HelplineTicker />)
    })

    HELPLINES.forEach(({ label, number, hours }) => {
      const link = container.querySelector(`a[href="tel:${number}"]`)
      expect(link.textContent).toContain(label)
      expect(link.textContent).toContain(number)
      expect(link.textContent).toContain(`(${hours})`)
    })
  })
})
