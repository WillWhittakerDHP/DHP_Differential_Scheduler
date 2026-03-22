export interface VersionBlockInstance {
  id: string
  name: string
  icon: string
  baseSqFt: number
  allowMultiple: boolean
  partInstances: Array<{
    id: string
    name: string
    baseFee: number
    baseTime: number
    rateOverBaseFee: number
    rateOverBaseTime: number
  }>
}

export interface AppointmentVersionsResponse {
  services: VersionBlockInstance[]
  properties: VersionBlockInstance[]
  options: VersionBlockInstance[]
  lineItems?: VersionBlockInstance[]
}
