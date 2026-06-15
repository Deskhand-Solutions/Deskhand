const MONOGRAM_MAP: Record<string, string> = {
  google: 'G',
  microsoft: 'MS',
  shopify: 'S',
  sap: 'SAP',
}

export const getIntegrationMonogram = (slug: string): string =>
  MONOGRAM_MAP[slug.toLowerCase()] ?? slug.slice(0, 1).toUpperCase()
