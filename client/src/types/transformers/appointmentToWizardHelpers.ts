export interface VersionBlockInstance {
  id: string
  name: string
  icon: string
  partInstances: Array<{
    id: string
    name: string
    baseFee: number
    baseTime: number
    feePerUnit: number
    timePerUnit: number
    baseMultiplier?: number | null
    rateMultiplier?: number | null
  }>
}

export interface AppointmentVersionsResponse {
  services: VersionBlockInstance[]
  properties: VersionBlockInstance[]
  options: VersionBlockInstance[]
  lineItems?: VersionBlockInstance[]
}
