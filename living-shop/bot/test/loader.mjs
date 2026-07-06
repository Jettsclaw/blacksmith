// Redirect '@vercel/blob' to an in-memory stub for tests.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@vercel/blob') {
    return { url: new URL('./blob-stub.mjs', import.meta.url).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
