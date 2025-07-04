const MAGIC = "88son.v1$"

export function toXson(obj: unknown): string {
  const jsonString = JSON.stringify(obj)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(jsonString)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(MAGIC + binary)
}

export function fromXson(payload: string): unknown {
  let binary = atob(payload)
  if (!binary.startsWith(MAGIC)) {
    throw new Error("Invalid payload")
  }
  binary = binary.slice(MAGIC.length)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const decoder = new TextDecoder()
  const jsonString = decoder.decode(bytes)
  return JSON.parse(jsonString)
}
