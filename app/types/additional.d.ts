export interface CoverageType {
    label: string
    value: string
    count: number
}

export interface AdditionalTypeResponse {
    success: boolean
    message: string
    data: CoverageType[]
}
