export interface User {
    id: number
    name: string
    email: string
    picture?: string
    avatar?: string
}

export interface AuthData {
    user: User
    token: {
        type: string
        token: string
        expiresAt: string | null
    }
}

export interface AuthResponse {
    success: boolean
    message: string
    data: AuthData
}