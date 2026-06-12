const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const automator = require('miniprogram-automator')

const projectRoot = path.resolve(__dirname, '..')
const defaultCliPath = 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
const rawOutputDir = path.join(projectRoot, 'screenshots', 'miniprogram')
const publicOutputDir = path.join(projectRoot, 'docs', 'assets', 'screenshots')

function argValue(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1]
  return fallback
}

function argFlag(name) {
  return process.argv.includes(`--${name}`)
}

function argNumber(name, fallback) {
  const value = Number(argValue(name, fallback))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function safeName(value) {
  return value
    .replace(/^\/+/, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/_+/g, '_') || 'page'
}

function withTimeout(promise, milliseconds, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout after ${milliseconds}ms`)), milliseconds)
    })
  ])
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath)
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  }
}

function assertMiniProgramScreenshot(filePath, systemInfo) {
  const size = readPngSize(filePath)
  if (!size) throw new Error(`screenshot is not a valid PNG: ${filePath}`)

  const widthCandidates = [
    Number(systemInfo.windowWidth),
    Number(systemInfo.screenWidth),
    Number(systemInfo.safeArea && systemInfo.safeArea.width)
  ].filter(value => Number.isFinite(value) && value > 0)

  const heightCandidates = [
    Number(systemInfo.windowHeight),
    Number(systemInfo.screenHeight),
    Number(systemInfo.safeArea && systemInfo.safeArea.height)
  ].filter(value => Number.isFinite(value) && value > 0)

  const maxExpectedWidth = widthCandidates.length ? Math.max(...widthCandidates) : 500
  const maxExpectedHeight = heightCandidates.length ? Math.max(...heightCandidates) : 1000
  const isLikelyDevToolsWindow =
    size.width > maxExpectedWidth * 1.45 ||
    size.height > maxExpectedHeight * 1.45 ||
    size.width > 900

  if (isLikelyDevToolsWindow) {
    throw new Error(`screenshot captured DevTools window: ${size.width}x${size.height}`)
  }

  return size
}

function publicRedactionRects(pagePath, size) {
  const w = size.width
  const h = size.height

  if (pagePath.includes('/pages/index/index')) {
    return [
      { x: Math.round(w * 0.08), y: Math.round(h * 0.42), width: Math.round(w * 0.84), height: Math.round(h * 0.52) }
    ]
  }

  if (pagePath.includes('/pages/treehole/treehole')) {
    return [
      { x: Math.round(w * 0.06), y: Math.round(h * 0.36), width: Math.round(w * 0.88), height: Math.round(h * 0.58) }
    ]
  }

  if (pagePath.includes('/pages/detail/detail')) {
    return [
      { x: Math.round(w * 0.05), y: Math.round(h * 0.12), width: Math.round(w * 0.9), height: Math.round(h * 0.74) }
    ]
  }

  if (pagePath.includes('/pages/usercenter/usercenter')) {
    return [
      { x: Math.round(w * 0.08), y: Math.round(h * 0.08), width: Math.round(w * 0.84), height: Math.round(h * 0.2) }
    ]
  }

  return []
}

function redactImage(inputPath, outputPath, rects) {
  if (!rects.length) {
    fs.copyFileSync(inputPath, outputPath)
    return
  }

  const rectJson = JSON.stringify(rects).replace(/'/g, "''")
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$inputPath = $env:MINIPROGRAM_CAPTURE_INPUT
$outputPath = $env:MINIPROGRAM_CAPTURE_OUTPUT
$rects = '${rectJson}' | ConvertFrom-Json
$bitmap = [System.Drawing.Bitmap]::FromFile($inputPath)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 247, 248, 250))
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 228, 232, 238), 1)
foreach ($rect in $rects) {
  $rectangle = New-Object System.Drawing.Rectangle ([int]$rect.x), ([int]$rect.y), ([int]$rect.width), ([int]$rect.height)
  $graphics.FillRectangle($brush, $rectangle)
  $graphics.DrawRectangle($pen, $rectangle)
}
$font = New-Object System.Drawing.Font 'Microsoft YaHei', 10
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 98, 108, 120))
foreach ($rect in $rects) {
  $graphics.DrawString('用户信息已脱敏', $font, $textBrush, [single]($rect.x + 12), [single]($rect.y + 12))
}
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
$brush.Dispose()
$pen.Dispose()
$font.Dispose()
$textBrush.Dispose()
`

  childProcess.execFileSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        MINIPROGRAM_CAPTURE_INPUT: inputPath,
        MINIPROGRAM_CAPTURE_OUTPUT: outputPath
      }
    }
  )
}

async function main() {
  const pagePath = argValue('page', '/pages/index/index')
  const name = argValue('name', safeName(pagePath))
  const cliPath = argValue('cliPath', defaultCliPath)
  const port = Number(argValue('port', '9420'))
  const rawDir = path.resolve(argValue('outDir', rawOutputDir))
  const publicDir = path.resolve(argValue('publicOutDir', publicOutputDir))
  const redact = argFlag('redact')
  const closeTool = argFlag('close')
  const screenshotTimeoutMs = argNumber('screenshot-timeout', 300000)
  const screenshotRetries = argNumber('screenshot-retries', 1)
  const waitMs = argNumber('wait', 3000)

  fs.mkdirSync(rawDir, { recursive: true })
  fs.mkdirSync(publicDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const rawScreenshotPath = path.join(rawDir, `${name}-${timestamp}.png`)
  const dataPath = path.join(rawDir, `${name}-${timestamp}.data.json`)
  const publicScreenshotPath = path.join(publicDir, `${name}.png`)

  let miniProgram
  try {
    const wsEndpoint = `ws://127.0.0.1:${port}`
    try {
      miniProgram = await automator.connect({ wsEndpoint })
    } catch (connectError) {
      childProcess.execFileSync(
        'cmd.exe',
        ['/c', cliPath, 'auto', '--project', projectRoot, '--port', String(port), '--trust-project'],
        { stdio: 'pipe' }
      )
      miniProgram = await automator.connect({ wsEndpoint })
    }

    const page = await miniProgram.reLaunch(pagePath)
    await page.waitFor(waitMs)

    const currentPage = await miniProgram.currentPage()
    const pageData = await currentPage.data()
    const systemInfo = await miniProgram.systemInfo()

    let lastError
    for (let attempt = 1; attempt <= screenshotRetries; attempt += 1) {
      try {
        await withTimeout(
          miniProgram.screenshot({ path: rawScreenshotPath }),
          screenshotTimeoutMs,
          `protocol screenshot attempt ${attempt}`
        )
        lastError = null
        break
      } catch (error) {
        lastError = error
      }
    }
    if (lastError) throw lastError

    const screenshotSize = assertMiniProgramScreenshot(rawScreenshotPath, systemInfo)
    const rects = redact ? publicRedactionRects(currentPage.path || pagePath, screenshotSize) : []
    redactImage(rawScreenshotPath, publicScreenshotPath, rects)

    fs.writeFileSync(
      dataPath,
      JSON.stringify(
        {
          page: currentPage.path,
          query: currentPage.query,
          systemInfo,
          screenshotSize,
          publicScreenshot: publicScreenshotPath,
          redacted: redact,
          data: pageData
        },
        null,
        2
      ),
      'utf8'
    )

    console.log(`page=${currentPage.path}`)
    console.log(`raw=${rawScreenshotPath}`)
    console.log(`public=${publicScreenshotPath}`)
    console.log(`data=${dataPath}`)
  } finally {
    if (miniProgram && closeTool) {
      await miniProgram.close()
    } else if (miniProgram) {
      miniProgram.disconnect()
    }
  }
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
