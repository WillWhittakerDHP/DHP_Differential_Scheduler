import type { SequelizeModelsBag } from './sequelizeModelsBag.js'

/** Feature 7 auth: `sessions` / `magic_links` optional FK to `users.id`. */
export function associateSequelizeAuth(m: SequelizeModelsBag): void {
  const { User, Session, MagicLink } = m

  User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' })
  Session.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  User.hasMany(MagicLink, { foreignKey: 'userId', as: 'magicLinks' })
  MagicLink.belongsTo(User, { foreignKey: 'userId', as: 'user' })
}
