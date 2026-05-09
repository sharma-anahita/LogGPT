const { parseLogs } = require('../utils/logParser')
const { sendLogsToKafka } = require('../producers/kafkaProducer.js')
const pool = require('../config/database')

exports.uploadLogs = async (req, res) => {
  try {
    const { logs, service, sessionId, sessionName } = req.body
    const userId = req.user.id;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' })
    }

    let finalSessionId = sessionId || null

    // Create a new session only when a name is given and no existing id
    if (sessionName && !sessionId) {
      const sessionQuery = `
        INSERT INTO sessions (user_id, name, status, config)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `
      const sessionResult = await pool.query(sessionQuery, [
        userId,
        sessionName,
        'processing',
        JSON.stringify({ service }),
      ])
      finalSessionId = sessionResult.rows[0].id
      console.log(`[Upload] Created session: ${finalSessionId}`)
    } else if (sessionId) {
      console.log(`[Upload] Using provided sessionId: ${sessionId}`)
    }

    const parsedLogs = parseLogs(logs, service)

    const logsWithSession = parsedLogs.map((log) => ({
      ...log,
      userId,
      sessionId: finalSessionId,
    }))

    await sendLogsToKafka(logsWithSession)

    res.json({
      message: 'Logs sent to kafka successfully',
      sessionId: finalSessionId,
      count: logsWithSession.length,
    })
  } catch (error) {
    console.error('Error uploading logs:', error)
    res.status(500).json({ error: 'Failed to upload logs' })
  }
}