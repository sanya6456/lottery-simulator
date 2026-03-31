function getDuplicateIndices(values: (number | null)[]): Set<number> {
  const seen = new Map<number, number>();
  const duplicates = new Set<number>();
  values.forEach((v, i) => {
    if (v === null) return;
    if (seen.has(v)) {
      duplicates.add(seen.get(v)!);
      duplicates.add(i);
    } else {
      seen.set(v, i);
    }
  });
  return duplicates;
}

export function hasDuplicateIndicesInArray(values: (number | null)[]): boolean {
  return getDuplicateIndices(values).size > 0;
}
