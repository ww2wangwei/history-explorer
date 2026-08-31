// Mimic the structure
type KeyFact = { label: string; value: string }
interface Entry {
  id: string
  summary: string
  source?: string
}

export const ENTRIES: Entry[] = [
  {
    id: 'a',
    summary: 'hello "world" foo',
    source: "中文《书》综合",
  },
  {
    id: 'b',
    summary: 'hello "another" bar',
  },
]
