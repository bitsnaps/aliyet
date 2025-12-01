export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    return {
        timestamp: new Date().toISOString(),
        config: {
            db: config.db
        }

    }
})