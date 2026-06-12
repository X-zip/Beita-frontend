const DEFAULT_MAX_DURATION = 700
const DEFAULT_MAX_VERTICAL = 90
const DEFAULT_RATIO = 1.35
const MAX_HOLD_BEFORE_MOVE = 320
const TRANSITION_DURATION = 220
const RESET_DURATION = 180
const MAX_DRAG_OFFSET = 48
const EDGE_MAX_DRAG_OFFSET = 14
const DRAG_FACTOR = 0.28
const EDGE_DRAG_FACTOR = 0.08

function getClassField(options) {
  return (options && options.classField) || 'tabSwipeClass'
}

function getStyleField(options) {
  return (options && options.styleField) || 'tabSwipeStyle'
}

function getTouch(touches) {
  return touches && touches.length === 1 ? touches[0] : null
}

function getCurrentIndex(page, options) {
  if (options && typeof options.getCurrentIndex === 'function') {
    return Number(options.getCurrentIndex(page)) || 0
  }
  const field = (options && options.indexField) || 'currentTab'
  return Number(page.data && page.data[field]) || 0
}

function getMaxIndex(page, options) {
  if (options && typeof options.getMaxIndex === 'function') {
    const maxIndex = Number(options.getMaxIndex(page))
    return isNaN(maxIndex) ? Infinity : maxIndex
  }
  if (options && typeof options.maxIndex === 'number') {
    return options.maxIndex
  }
  if (page.data && page.data.menu && page.data.menu.name) {
    return page.data.menu.name.length - 1
  }
  if (page.data && page.data.sub_menu && page.data.sub_menu.descs) {
    return page.data.sub_menu.descs.length - 1
  }
  return Infinity
}

function isAtBoundary(page, direction, options) {
  const currentIndex = getCurrentIndex(page, options)
  const maxIndex = getMaxIndex(page, options)
  return (direction < 0 && currentIndex <= 0) || (direction > 0 && currentIndex >= maxIndex)
}

function setSwipeVisual(page, options, className, style) {
  const classField = getClassField(options)
  const styleField = getStyleField(options)
  const data = {}
  data[classField] = className || ''
  data[styleField] = style || ''
  page.setData(data)
}

function touchStart(page, e, options) {
  const touch = getTouch(e.touches)
  if (!touch) {
    page._tabSwipe = null
    return
  }
  clearTimeout(page._tabSwipeTransitionTimer)
  clearTimeout(page._tabSwipeResetTimer)
  page._tabSwipe = {
    startX: touch.clientX,
    startY: touch.clientY,
    startTime: Date.now(),
    options: options || {},
    cancelled: false
  }
}

function touchMove(page, e, options) {
  const gesture = page._tabSwipe
  const touch = getTouch(e.touches)
  if (!gesture || !touch) {
    if (gesture) {
      gesture.cancelled = true
    }
    return
  }

  const moveX = touch.clientX - gesture.startX
  const moveY = touch.clientY - gesture.startY
  const absX = Math.abs(moveX)
  const absY = Math.abs(moveY)
  const gestureOptions = options || gesture.options || {}

  if ((absX > 8 || absY > 8) && !gesture.firstMoveTime) {
    gesture.firstMoveTime = Date.now()
    if (gesture.firstMoveTime - gesture.startTime > MAX_HOLD_BEFORE_MOVE) {
      gesture.cancelled = true
      return
    }
  }

  if (absY > 36 && absY > absX) {
    gesture.cancelled = true
    reset(page, gestureOptions)
    return
  }

  if (!gesture.locked && absX > 12 && absX > absY * 1.2) {
    gesture.locked = true
  }

  if (!gesture.locked) {
    return
  }

  const now = Date.now()
  if (gesture.lastPaintTime && now - gesture.lastPaintTime < 16) {
    return
  }
  gesture.lastPaintTime = now

  const direction = moveX < 0 ? 1 : -1
  const atBoundary = isAtBoundary(page, direction, gestureOptions)
  const maxOffset = atBoundary ? EDGE_MAX_DRAG_OFFSET : MAX_DRAG_OFFSET
  const dragFactor = atBoundary ? EDGE_DRAG_FACTOR : DRAG_FACTOR
  const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, moveX * dragFactor))
  const opacity = Math.max(0.9, 1 - Math.abs(limitedOffset) / 700)
  setSwipeVisual(
    page,
    gestureOptions,
    'ux-tab-dragging',
    'transform: translateX(' + limitedOffset + 'px); opacity: ' + opacity.toFixed(3) + ';'
  )
}

function touchCancel(page, options) {
  page._tabSwipe = null
  reset(page, options)
}

function getDirection(page, e, options) {
  const gesture = page._tabSwipe
  page._tabSwipe = null
  if (!gesture || gesture.cancelled) {
    return 0
  }

  const touch = getTouch(e.changedTouches)
  if (!touch) {
    return 0
  }

  const optionsValue = options || {}
  const duration = Date.now() - gesture.startTime
  const moveX = touch.clientX - gesture.startX
  const moveY = touch.clientY - gesture.startY
  const absX = Math.abs(moveX)
  const absY = Math.abs(moveY)
  const width = page.data.width || 375
  const minDistance = optionsValue.minDistance || Math.max(56, width * 0.16)
  const maxDuration = optionsValue.maxDuration || DEFAULT_MAX_DURATION
  const maxVertical = optionsValue.maxVertical || DEFAULT_MAX_VERTICAL
  const ratio = optionsValue.ratio || DEFAULT_RATIO

  if (duration > maxDuration || absX < minDistance || absY > maxVertical || absX < absY * ratio) {
    return 0
  }

  const direction = moveX < 0 ? 1 : -1
  if (isAtBoundary(page, direction, optionsValue)) {
    return 0
  }

  return direction
}

function reset(page, options) {
  const classField = getClassField(options)
  const styleField = getStyleField(options)
  const hasVisual = page.data && (page.data[classField] || page.data[styleField])
  if (!hasVisual) {
    return
  }

  clearTimeout(page._tabSwipeResetTimer)
  setSwipeVisual(page, options, 'ux-tab-swipe-reset', 'transform: translateX(0); opacity: 1;')
  page._tabSwipeResetTimer = setTimeout(function () {
    setSwipeVisual(page, options, '', '')
  }, RESET_DURATION)
}

function playTransition(page, direction, field, styleField) {
  const dataField = field || 'tabSwipeClass'
  const inlineStyleField = styleField || 'tabSwipeStyle'
  const className = direction > 0 ? 'ux-tab-swipe-left' : 'ux-tab-swipe-right'
  const clearData = {}
  clearData[dataField] = ''
  clearData[inlineStyleField] = ''

  clearTimeout(page._tabSwipeTransitionTimer)
  clearTimeout(page._tabSwipeResetTimer)
  page.setData(clearData)

  setTimeout(function () {
    const data = {}
    data[dataField] = className
    page.setData(data)

    page._tabSwipeTransitionTimer = setTimeout(function () {
      const resetData = {}
      resetData[dataField] = ''
      resetData[inlineStyleField] = ''
      page.setData(resetData)
    }, TRANSITION_DURATION)
  }, 0)
}

module.exports = {
  touchStart,
  touchMove,
  touchCancel,
  getDirection,
  reset,
  playTransition
}
