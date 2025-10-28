import type { CoverageItem, CoverageResponse } from '~/types/coverage'

interface GetCoverageParams {
  apiUrl: string
  longitude: number
  latitude: number
  mode: 'radius' | 'limit'
  value: number
}

export async function getCoverage({
  apiUrl,
  longitude,
  latitude,
  mode,
  value
}: GetCoverageParams): Promise<CoverageItem[]> {
  let url = `${apiUrl}/coverage?longitude=${longitude}&latitude=${latitude}`

  if (mode === 'radius') url += `&radius=${value}`
  else if (mode === 'limit') url += `&limit=${value}`

  const res = await fetch(url)
  const response: CoverageResponse = await res.json()

  if (!response.success || !response.data) return []
  return response.data
}
