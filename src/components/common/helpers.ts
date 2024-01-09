export function toClassName(
  def:
    | (string | null | undefined)[]
    | Record<string, string | number | bigint | boolean | undefined | symbol | null>
    | string
    | null
    | undefined
): string {
  /**
   * Convert class name definition into string representation.
   * For example:
   *   def = ["a", "", undefined, "b"], returns "a b"
   *   def = {"a": true, "": true, "b": false, "c": true}, returns "a c"
   */
  if (!def) {
    return ""
  }
  if (typeof def === "string") {
    return def
  }
  if (!Array.isArray(def)) {
    const cls: string[] = []
    for (const k in def) {
      if (k && def[k]) {
        cls.push(k)
      }
    }
    def = cls
  }
  return def.filter(s => s).join(" ")
}
