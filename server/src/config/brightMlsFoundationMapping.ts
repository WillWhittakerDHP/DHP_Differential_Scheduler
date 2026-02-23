
type FoundationAccessType = 'basement' | 'crawlspace' | 'slab' | null;

const FOUNDATION_MAPPING: Record<string, FoundationAccessType> = {
  basement: 'basement',
  crawl: 'crawlspace',
  crawlspace: 'crawlspace',
  slab: 'slab',
  pier: null,
  pilings: null,
};

export function mapFoundationType(
  foundationDetails: string[] | string | null | undefined
): FoundationAccessType {
  if (!foundationDetails) {
    return null;
  }

  const parts = Array.isArray(foundationDetails)
    ? foundationDetails
    : [foundationDetails];

  const lower = parts
    .filter((p): p is string => typeof p === 'string')
    .map((p) => p.toLowerCase().trim());

  for (const part of lower) {
    for (const [keyword, mapped] of Object.entries(FOUNDATION_MAPPING)) {
      if (part.includes(keyword) && mapped !== null) {
        return mapped;
      }
    }
  }

  return null;
}
