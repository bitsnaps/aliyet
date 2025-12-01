export default defineEventHandler(async (event) => {
    return {
        timestamp: new Date().toISOString(),
        env: process.env,

    }
})