import type { LibraryTvItem } from '../types/library'

export function streamingProviders(item: LibraryTvItem): string[] {
  return item.cached.streamingProviders ?? []
}

export function primaryStreamingProvider(item: LibraryTvItem): string | null {
  const list = streamingProviders(item)
  return list[0] ?? null
}

export function hasStreamingProvider(
  item: LibraryTvItem,
  provider: string,
): boolean {
  return streamingProviders(item).includes(provider)
}

export function collectStreamingProviders(items: LibraryTvItem[]): string[] {
  const set = new Set<string>()
  for (const item of items) {
    for (const name of streamingProviders(item)) {
      set.add(name)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}
