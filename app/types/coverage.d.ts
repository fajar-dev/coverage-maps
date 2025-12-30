export interface CoverageItem {
  id: number
  name: string
  address: string
  coordinate: string
  type: string
}

export interface GetCoverageParams {
  apiUrl: string
  longitude: number
  latitude: number
  mode: 'radius' | 'limit'
  value: number
}

export interface CoverageResponse {
  success: boolean
  data: CoverageItem[]
}

export interface ExportCoverageParams extends GetCoverageParams {
  types?: string[]
}