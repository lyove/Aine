// SelectDropdown dropdown panel positioning algorithm
// Split into pure functions for easy unit testing and maintenance

/**
 * Compute the dropdown panel position.
 * Horizontal: expand right by default, align to the right edge if there is no room.
 * Vertical: expand down by default, flip upward if there is no room below.
 * @param {HTMLElement} anchorEl the trigger button element
 * @param {object} opts { menuWidth, maxHeight, multiple }
 * @returns {{ left:number, top:number, width:number, openUp:boolean, rect:DOMRect, margin:number, gap:number }}
 */
export function computePosition(anchorEl, { menuWidth, maxHeight, multiple }) {
  const rect = anchorEl.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const margin = 8;
  const gap = 6;

  // Horizontal: try opening to the right; flip left if it would overflow.
  let left;
  if (rect.left + menuWidth <= vw - margin) {
    left = rect.left;
  } else {
    left = Math.max(margin, rect.right - menuWidth);
  }

  // Vertical: open below; flip up when there isn't enough room.
  // Use estimated height for the first paint, then measure real height on nextTick.
  const estHeight = maxHeight + (multiple ? 90 : 56);
  let top;
  let openUp = false;
  if (rect.bottom + estHeight <= vh - margin) {
    top = rect.bottom + gap;
  } else {
    openUp = true;
    top = Math.max(margin, rect.top - estHeight - gap);
  }

  return { left, top, width: menuWidth, openUp, rect, margin, gap };
}
