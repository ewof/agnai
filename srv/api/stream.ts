import { Response } from 'express'
import { AppRequest } from './wrap'

export function setSSEHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
}

/**
 * Detect client disconnects without treating reverse-proxy connection resets as
 * user-initiated cancellations.
 */
export function onClientDisconnect(req: AppRequest, res: Response, onDisconnect: () => void) {
  const listener = () => {
    if (res.writableEnded) return
    onDisconnect()
  }

  res.on('close', listener)
  return () => res.removeListener('close', listener)
}