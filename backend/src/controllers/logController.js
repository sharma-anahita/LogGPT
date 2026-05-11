const { parseLogs } = require('../utils/logParser')
const { sendLogsToKafka } = require('../producers/kafkaProducer.js')
const pool = require('../config/database')

const KAFKA_UPLOAD_TIMEOUT_MS = parseInt(process.env.KAFKA_UPLOAD_TIMEOUT_MS || '15000', 10)

function withTimeout(promise, timeoutMs, label = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    }),
  ])
}

async function insertLogsDirectly(logs) {
  const insertQuery = `
    INSERT INTO logs (user_id, session_id, timestamp, level, service, message, raw)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `

  const inserted = []
  for (const log of logs) {
    const values = [
      log.userId,
      log.sessionId,
      log.timestamp || new Date().toISOString(),
      log.level || 'info',
      log.service || 'unknown',
      log.message || '',
      log.raw || '',
    ]
    const result = await pool.query(insertQuery, values)
    inserted.push(result.rows[0])
  }

  return inserted
}

exports.uploadLogs = async (req, res) => {
  try {
    const { logs, service, sessionId, sessionName } = req.body
    const userId = req.user.id;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' })
    }

    if (!sessionName && !sessionId) {
      return res.status(400).json({ error: 'sessionName or sessionId is required' })
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

    let fallbackToDb = false
    let fallbackReason = null

    try {
      await withTimeout(sendLogsToKafka(logsWithSession), KAFKA_UPLOAD_TIMEOUT_MS, 'Kafka upload')
    } catch (kafkaError) {
      fallbackToDb = true
      fallbackReason = kafkaError.message
      console.error('[Upload] Kafka unavailable, falling back to direct DB insert:', fallbackReason)
      await insertLogsDirectly(logsWithSession)
    }

    res.json({
      message: fallbackToDb ? 'Logs uploaded via database fallback' : 'Logs sent to kafka successfully',
      sessionId: finalSessionId,
      count: logsWithSession.length,
      fallbackToDb,
      fallbackReason,
    })
  } catch (error) {
    console.error('Error uploading logs:', error)
    res.status(500).json({ error: 'Failed to upload logs' })
  }
}