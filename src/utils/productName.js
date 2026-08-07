// Splits a product name with a trailing parenthetical into a main line and a
// sub line, dropping the brackets. e.g.
//   "152mm HE-FRAG Round (Full Charge)" -> { main: "152mm HE-FRAG Round", sub: "Full Charge" }
//   "Full Variable Propelling Charge (152mm JN-546)" -> { main: "...Charge", sub: "152mm JN-546" }
//   "155mm HE ERFB-BB Round" -> { main: "155mm HE ERFB-BB Round", sub: null }
export function splitProductName(name) {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (m) return { main: m[1].trim(), sub: m[2].trim() }
  return { main: name, sub: null }
}
