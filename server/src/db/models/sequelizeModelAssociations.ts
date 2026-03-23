import type { SequelizeModelsBag } from './sequelizeModelsBag.js'
import { associateSequelizeShapesAndEvents } from './sequelizeModelAssociationsPartA.js'
import { associateSequelizePropertyAdminAndAvailability } from './sequelizeModelAssociationsPartB.js'

export function associateSequelizeModels(m: SequelizeModelsBag): void {
  associateSequelizeShapesAndEvents(m)
  associateSequelizePropertyAdminAndAvailability(m)
}
