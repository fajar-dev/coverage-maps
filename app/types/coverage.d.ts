export interface CoverageItem {
  id: number
  residentName: string
  streetName: string
  no: string
  type: 'Fiberstar' | 'CGS' | 'SIP'
  homepassedCoordinate: string
  distance: number
}

export interface CoverageResponse {
  success: boolean
  data: CoverageItem[]
}
