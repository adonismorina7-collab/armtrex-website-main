// Lightweight deterrent against casual copying of site text and images.
// NOTE: this is a deterrent only — anyone with browser dev tools or "view
// source" can still reach the raw assets. It stops right-click "Save image",
// text selection/copy, and image drag-out for ordinary visitors. Form fields
// (name/email/subject/message) stay fully usable so the contact form works.

// True when the event originates inside a form control we must leave alone.
function inEditable(target) {
  const el = target?.closest?.('input, textarea, select, [contenteditable="true"]')
  return Boolean(el)
}

export function installContentProtection() {
  if (typeof document === 'undefined') return

  // Block the context menu except on form fields (so paste still works there).
  document.addEventListener('contextmenu', (e) => {
    if (!inEditable(e.target)) e.preventDefault()
  })

  // Block copy / cut unless the user is inside a form field.
  const blockClipboard = (e) => {
    if (!inEditable(e.target)) e.preventDefault()
  }
  document.addEventListener('copy', blockClipboard)
  document.addEventListener('cut', blockClipboard)

  // Block dragging images out of the page.
  document.addEventListener('dragstart', (e) => {
    if (e.target?.tagName === 'IMG') e.preventDefault()
  })
}
