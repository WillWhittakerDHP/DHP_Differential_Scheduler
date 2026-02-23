
import {
  HTTP_STATUS_CODES,
  ERROR_MESSAGE_TEMPLATES,
  VALIDATION_FAILED_MESSAGE,
} from '../router'

describe('router constants contract', () => {
  describe('HTTP_STATUS_CODES', () => {
    it('has expected status codes', () => {
      expect(HTTP_STATUS_CODES.OK).toBe(200)
      expect(HTTP_STATUS_CODES.CREATED).toBe(201)
      expect(HTTP_STATUS_CODES.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS_CODES.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })

  describe('ERROR_MESSAGE_TEMPLATES', () => {
    it('has expected template keys', () => {
      expect(ERROR_MESSAGE_TEMPLATES.FETCH_FAILED).toContain('{displayName}')
      expect(ERROR_MESSAGE_TEMPLATES.CREATE_FAILED).toContain('{displayName}')
      expect(ERROR_MESSAGE_TEMPLATES.NOT_FOUND).toBeDefined()
    })
  })

  describe('VALIDATION_FAILED_MESSAGE', () => {
    it('is a non-empty string', () => {
      expect(typeof VALIDATION_FAILED_MESSAGE).toBe('string')
      expect(VALIDATION_FAILED_MESSAGE.length).toBeGreaterThan(0)
    })
  })
})
