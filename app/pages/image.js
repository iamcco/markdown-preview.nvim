function resolveImage (tokens, idx) {
  const src = tokens[idx].attrs[0][1]
  const alt = tokens[idx].content
  if (/^(http|\/\/|data:)/.test(src)) {
    return `<img src="${src}" alt="${alt}" />`
  }
  return `<img src="/_local_image_${src}" alt="${alt}" />`
}

export default function localImage (md) {
  md.renderer.rules.image = resolveImage
}

