function scroll (offsetTop) {
  [document.body, document.documentElement].forEach((ele) => {
    // eslint-disable-next-line
    TweenLite.to(
      ele,
      0.4,
      {
        scrollTop: offsetTop,
        ease: Power2.easeOut // eslint-disable-line
      }
    )
  })
}

function getAttrTag (line) {
  return `[data-source-line="${line}"]`
}

function getPreLineOffsetTop (line) {
  let currentLine = line - 1
  let ele = null
  while (currentLine > 0 && !ele) {
    ele = document.querySelector(getAttrTag(currentLine))
    if (!ele) {
      currentLine -= 1
    }
  }
  return [
    currentLine >= 0 ? currentLine : 0,
    ele ? ele.offsetTop : 0
  ]
}

function getNextLineOffsetTop (line, len) {
  let currentLine = line + 1
  let ele = null
  while (currentLine <= len && !ele) {
    ele = document.querySelector(getAttrTag(currentLine))
    if (!ele) {
      currentLine += 1
    }
  }
  return [
    currentLine <= len ? currentLine : len,
    ele ? ele.offsetTop : document.documentElement.scrollHeight
  ]
}

export default function scrollToLine (line, len) {
  const lineEle = document.querySelector(`[data-source-line="${line}"]`)
  if (lineEle) {
    scroll(lineEle.offsetTop)
  } else {
    const pre = getPreLineOffsetTop(line)
    const next = getNextLineOffsetTop(line, len)
    scroll(pre[1] + ((next[1] - pre[1]) * (line - pre[0]) / (next[0] - pre[0])))
  }
}

