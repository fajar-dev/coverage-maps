import type { ExportCoverageParams, GetCoverageParams } from "~/types/coverage"
import { apiService } from "./apiService"

export class CoverageService {
  async getCoverage({
    longitude,
    latitude,
    mode,
    value
  }: Omit<GetCoverageParams, 'apiUrl'>) {
    const params: any = { longitude, latitude }

    if (mode === 'radius') {
      params['radius'] = value
    } else if (mode === 'limit') {
      params['limit'] = value
    }

    try {
      const response = await apiService.client.get('/coverage', { params })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch coverage: ${error.message}`)
    }
  }

  async exportCoverage({
    longitude,
    latitude,
    mode,
    value,
    types
  }: Omit<ExportCoverageParams, 'apiUrl'>): Promise<void> {
    if (typeof window === 'undefined') return

    const params: any = { longitude, latitude }

    if (mode === 'radius') {
      params['radius'] = value
    } else if (mode === 'limit') {
      params['limit'] = value
    }

    if (types && types.length > 0) {
      params['type'] = types.join(',')
    }

    try {
      const response = await apiService.client.get('/export', {
        params,
        responseType: 'blob',
        headers: {
          Accept: 'text/csv'
        }
      })

      const blob = new Blob([response.data])
      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      a.download = `coverage-${timestamp}.csv`

      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(blobUrl)
    } catch (error: any) {
      console.error('Failed to export coverage', error)
      throw new Error(`Export failed: ${error.message}`)
    }
  }
}

export const coverageService = new CoverageService()
