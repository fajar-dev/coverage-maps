import { apiService } from "./apiService"
import type { AuthResponse } from "~/types/auth"

export class AuthService {
  private readonly TOKEN_KEY = 'auth_token'
  private readonly USER_KEY = 'auth_user'

  public user = ref<AuthResponse['user'] | null>(null)
  public token = ref<string | null>(null)

  constructor() {
    this.initSession()
  }

  private initSession() {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem(this.TOKEN_KEY)
    const user = localStorage.getItem(this.USER_KEY)

    if (token && user) {
      this.token.value = token
      this.user.value = JSON.parse(user)
    }
  }

  async googleLogin(code: string): Promise<AuthResponse> {
    try {
      const response = await apiService.client.post<AuthResponse>('/auth/login', { code })
      this.setSession(response.data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to login with Google: ${error.message}`)
    }
  }

  logout() {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)

    this.token.value = null
    this.user.value = null

    // Optional: Reload page or redirect
    // window.location.reload() 
  }

  private setSession(data: AuthResponse) {
    if (typeof window === 'undefined') return

    localStorage.setItem(this.TOKEN_KEY, data.token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))

    this.token.value = data.token
    this.user.value = data.user
  }
}

export const authService = new AuthService()
