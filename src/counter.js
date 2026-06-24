/**
 * Pure function: increment a counter by a given amount.
 * This is the unit under test — no DOM, no side effects.
 *
 * @param {number} currentValue - the current count
 * @param {number} [by=1] - how much to increment by
 * @returns {number} the new count
 */
function incrementCounter(currentValue, by) {
  if (by === undefined) {
    by = 2;
  }
  return currentValue + by;
}

// Wire up the DOM (only runs in the browser)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var count = 0;
    var display = document.getElementById('counter-value');
    var button = document.getElementById('increment-btn');

    if (button && display) {
      button.addEventListener('click', function () {
        count = incrementCounter(count);
        display.textContent = count;
      });
    }
  });
}

// Export for Node.js test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { incrementCounter: incrementCounter };
}
