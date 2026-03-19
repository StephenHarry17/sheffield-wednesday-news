export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureEnvLoaded } = await import('./lib/env-loader');
    await ensureEnvLoaded();
  }
}
