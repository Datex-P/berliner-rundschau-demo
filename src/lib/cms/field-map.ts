type FieldMap = Record<string, string>;

export function parseFieldMap(raw: string | undefined): FieldMap {
  if (!raw || !raw.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      console.warn("[cms] FIELD_MAP is not a JSON object, ignoring");
      return {};
    }
    const result: FieldMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) {
        result[key] = value.trim();
      }
    }
    return result;
  } catch {
    console.warn("[cms] FIELD_MAP is not valid JSON, ignoring");
    return {};
  }
}

export function mapField(fieldMap: FieldMap, internalName: string): string {
  return fieldMap[internalName] ?? internalName;
}
