import type { ModuleDefinition } from '../types'
import { EmailMarketingPage } from './EmailMarketingPage'

export { EmailMarketingPage } from './EmailMarketingPage'

export const emailMarketingModule: ModuleDefinition = {
  slug: 'email_marketing',
  name: 'E-Mail-Marketing',
  description:
    'KI-gestützter Editor für professionelle HTML-Marketing-E-Mails mit Vorschau.',
  Page: EmailMarketingPage,
}
