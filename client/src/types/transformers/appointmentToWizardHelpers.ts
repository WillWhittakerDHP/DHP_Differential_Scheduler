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
  }>
}

export interface AppointmentVersionsResponse {
  services: VersionBlockInstance[]
  properties: VersionBlockInstance[]
  options: VersionBlockInstance[]
  lineItems?: VersionBlockInstance[]
}
