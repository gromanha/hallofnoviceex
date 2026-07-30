import fs from 'fs'
import path from 'path'

const COLORS = {
  reset:   '\x1b[0m',
  bright:  '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
}

const ICONS = {
  step:    '[▶]',
  success: '[✓]',
  error:   '[✗]',
  warn:    '[!]',
  info:    '[i]',
  progress:'[→]',
  timer:   '[⏱]',
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

class Logger {
  constructor() {
    this.steps = []
    this.currentStep = null
    this.startTime = Date.now()
    this.logFile = null
  }

  initLogFile(logDir, slug) {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    const date = new Date().toISOString().slice(0, 10)
    const filePath = path.join(logDir, `${date}_${slug}.log`)
    this.logFile = filePath
    const header = `=== Wiki Pipeline Log ===\nData: ${new Date().toISOString()}\n\n`
    fs.writeFileSync(filePath, header)
  }

  _writeLog(level, message) {
    if (!this.logFile) return
    const timestamp = new Date().toISOString().slice(11, 19)
    const line = `[${timestamp}] [${level}] ${message}\n`
    fs.appendFileSync(this.logFile, line)
  }

  step(name) {
    this.currentStep = { name, startTime: Date.now(), substeps: [] }
    console.log()
    console.log(`${COLORS.cyan}${ICONS.step} ${COLORS.bright}${name}${COLORS.reset}`)
    console.log(`${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`)
    this._writeLog('STEP', name)
  }

  substep(message) {
    const elapsed = this.currentStep ? Date.now() - this.currentStep.startTime : 0
    console.log(`  ${COLORS.dim}${ICONS.progress} ${COLORS.reset}${message} ${COLORS.dim}(${formatTime(elapsed)})${COLORS.reset}`)
    this._writeLog('INFO', message)
  }

  progress(current, total, label = '') {
    const pct = Math.round((current / total) * 100)
    const filled = Math.round(pct / 5)
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
    const elapsed = this.currentStep ? Date.now() - this.currentStep.startTime : 0
    const eta = current > 0 ? ((elapsed / current) * (total - current)) : 0

    process.stdout.write(
      `\r  ${COLORS.blue}${bar} ${COLORS.bright}${pct}%${COLORS.reset} ` +
      `${COLORS.dim}(${current}/${total})${COLORS.reset} ` +
      `${COLORS.dim}${label}${COLORS.reset} ` +
      `${COLORS.dim}ETA: ${formatTime(Math.round(eta))}${COLORS.reset}   `
    )
    if (current === total) console.log()
  }

  success(message) {
    const elapsed = this.currentStep ? Date.now() - this.currentStep.startTime : 0
    console.log(`  ${COLORS.green}${ICONS.success} ${message}${COLORS.reset}` +
      (elapsed > 0 ? ` ${COLORS.dim}(${formatTime(elapsed)})${COLORS.reset}` : ''))
    this._writeLog('SUCCESS', message)
  }

  error(message, details = null) {
    console.log(`  ${COLORS.red}${ICONS.error} ${message}${COLORS.reset}`)
    if (details) {
      console.log(`    ${COLORS.dim}${details}${COLORS.reset}`)
    }
    this._writeLog('ERROR', `${message}${details ? ' - ' + details : ''}`)
  }

  warn(message) {
    console.log(`  ${COLORS.yellow}${ICONS.warn} ${message}${COLORS.reset}`)
    this._writeLog('WARN', message)
  }

  info(message) {
    console.log(`  ${COLORS.dim}${ICONS.info} ${message}${COLORS.reset}`)
    this._writeLog('INFO', message)
  }

  data(key, value) {
    console.log(`    ${COLORS.dim}${key}:${COLORS.reset} ${COLORS.bright}${value}${COLORS.reset}`)
    this._writeLog('DATA', `${key}: ${value}`)
  }

  summary(results) {
    const totalElapsed = Date.now() - this.startTime
    console.log()
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)
    console.log(`${COLORS.bright}${COLORS.cyan}  RESUMO DO PIPELINE${COLORS.reset}`)
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)
    console.log()

    for (const result of results) {
      const icon = result.success ? COLORS.green + ICONS.success : result.skipped ? COLORS.dim + '[—]' : COLORS.red + ICONS.error
      console.log(`  ${icon} ${COLORS.bright}${result.step}${COLORS.reset}`)
      if (result.message) {
        console.log(`      ${COLORS.dim}${result.message}${COLORS.reset}`)
      }
      if (result.error) {
        console.log(`      ${COLORS.red}${result.error}${COLORS.reset}`)
      }
    }

    console.log()
    console.log(`${COLORS.dim}  Tempo total: ${COLORS.bright}${formatTime(totalElapsed)}${COLORS.reset}`)
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`)

    this._writeLog('SUMMARY', `Tempo total: ${formatTime(totalElapsed)}`)
  }
}

export const logger = new Logger()
