/**
 * Token Refresh Utilities (Deprecated - Use Silent Middleware Refresh Instead)
 * 
 * Tokens are now automatically refreshed by the middleware in the background.
 * This file is kept for reference but is no longer used.
 * 
 * The middleware refreshes tokens when they will expire within 1 hour.
 * No client-side action is needed - the process is completely transparent to users.
 */

// Tokens are now refreshed silently by middleware
export function useTokenRefresh() {
  // No-op - tokens are refreshed silently by middleware
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = '/login'
  } catch (error) {
    console.error('Sign out error:', error)
    window.location.href = '/login'
  }
}
