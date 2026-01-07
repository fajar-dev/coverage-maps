import { apiService } from "./apiService"
import type { AdditionalTypeResponse } from "~/types/additional"

export class AdditionalService {
    async getCoverageTypes(): Promise<AdditionalTypeResponse> {
        try {
            const response = await apiService.client.get('/additional/type')
            return response.data
        } catch (error: any) {
            throw new Error(`Failed to fetch coverage types: ${error.message}`)
        }
    }
}

export const additionalService = new AdditionalService()
