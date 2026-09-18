export const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Keeps short operations visible long enough for a calm, predictable transition. */
export async function withMinimumDuration<T>(operation: () => Promise<T>, minimumMilliseconds: number): Promise<T> {
  const startedAt = Date.now();
  try {
    return await operation();
  } finally {
    await wait(Math.max(0, minimumMilliseconds - (Date.now() - startedAt)));
  }
}
