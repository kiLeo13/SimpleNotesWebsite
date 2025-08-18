const KB = 1024
const MB = KB * 1024
const GB = MB * 1024

function formatNumber(num) {
  return num.toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

function getPrettySize(size) {
  if (size < KB) return `${size} Bytes`
  if (size < MB) return `${formatNumber(size / KB)} KB`
  if (size < GB) return `${formatNumber(size / MB)} MB`
  
  return `${formatNumber(size / GB)} GB`
}

export default { getPrettySize }