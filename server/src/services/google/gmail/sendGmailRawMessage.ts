/**
 * WHY: Send plain-text mail via Gmail API using the same OAuth client as Calendar (Feature 7.3.2).
 * PATTERN: RFC 5322-ish message, base64url `raw` for users.messages.send — see Gmail API docs.
 */

import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'

export type SendGmailRawMessageInput = {
  from: string
  to: string
  subject: string
  textBody: string
}

/**
 * Sends a simple UTF-8 plain-text message. `from` must be allowed for the authenticated Google account
 * (primary address or a configured “Send mail as” alias).
 */
export async function sendGmailRawMessage(input: SendGmailRawMessageInput): Promise<void> {
  const { from, to, subject, textBody } = input
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    textBody,
  ].join('\r\n')

  const raw = Buffer.from(message, 'utf8').toString('base64url')

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
