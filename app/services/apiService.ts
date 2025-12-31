import axios from 'axios'
import type { AxiosInstance } from 'axios'

export class ApiService {
  public get client(): AxiosInstance {
    const config = useRuntimeConfig()
    let token = null
    
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token')
    }
    
    return axios.create({
      baseURL: config.public.apiUrl as string,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  }
}

export const apiService = new ApiService()
