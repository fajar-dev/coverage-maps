// types/coverage.ts

export interface CoverageParams {
  longitude: number
  latitude: number
  radius: number
  limit: number
}

export interface CoverageItem {
  id: number
  residentName: string
  streetName: string
  no: string
  homepassedCoordinate: string
  distance: number
}

export interface CoverageResponse {
  success: boolean
  message?: string
  data?: CoverageItem[]
}
