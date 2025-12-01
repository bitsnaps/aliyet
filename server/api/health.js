
export default defineEventHandler(async (event) => {
    const db = useDB();
    
    return {
        timestamp: new Date().toISOString(),
        dbConfig: db.config ?'ok':'error'
    }
})