export async function toXson(
  obj: unknown,
  format: CompressionFormat = "deflate-raw"
): Promise<string> {
  const input = new Blob([JSON.stringify(obj)]).stream()
  const processor = new CompressionStream(format)
  const output = new Response(input.pipeThrough(processor))
  const result = btoa(
    [...new Uint8Array(await output.arrayBuffer())].map(c => String.fromCharCode(c)).join("")
  )
  return result
}

export async function fromXson(
  payload: string,
  format: CompressionFormat = "deflate-raw"
): Promise<unknown> {
  const input = new Blob([new Uint8Array([...atob(payload)].map(s => s.charCodeAt(0)))]).stream()
  const processor = new DecompressionStream(format)
  const output = new Response(input.pipeThrough(processor))
  const result = await output.json()
  return result
}
