interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export async function loginWithGoogle(apiUrl: string, code: string): Promise<AuthResponse> {
  const response = await fetch(`${apiUrl}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ code })
  })

  if (!response.ok) {
    throw new Error('Failed to login with Google')
  }

  return response.json()
}
