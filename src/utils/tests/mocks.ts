import { vi } from 'vitest'

export function createMockRouter(overrides?: Partial<ReturnType<typeof createMockRouter>>) {
  return {
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...overrides,
  }
}

export function createMockSettings(overrides?: Record<string, unknown>) {
  return {
    settings: {
      mode: 'light',
      skin: 'default',
      semiDark: false,
      layout: 'vertical',
      navbarContentWidth: 'compact',
      contentWidth: 'compact',
      footerContentWidth: 'compact',
      primaryColor: '#9155FD',
      ...overrides,
    },
    updateSettings: vi.fn(),
    isSettingsChanged: false,
    resetSettings: vi.fn(),
    updatePageSettings: () => () => {},
  }
}

export function createSignInResponse(url: string | null, error?: string) {
  return { url, error }
}

export function createValidCredentials() {
  return {
    document: '123456789',
    password: 'password123',
    documentType: 'cedula',
  }
}
