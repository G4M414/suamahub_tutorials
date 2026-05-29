export async function register() {
  if (process.env.NODE_ENV !== 'production') {
    const { setGlobalDispatcher, Agent } = await import('undici');
    setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
  }
}
