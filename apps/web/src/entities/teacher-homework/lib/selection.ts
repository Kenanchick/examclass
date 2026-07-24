export function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function toggleSelectionGroup(
  values: string[],
  groupValues: string[],
) {
  const selectedValues = new Set(values);
  const isGroupSelected = groupValues.every((value) => selectedValues.has(value));

  if (isGroupSelected) {
    return values.filter((value) => !groupValues.includes(value));
  }

  return [...new Set([...values, ...groupValues])];
}
