const { incrementCounter } = require('../../src/counter');

describe('incrementCounter()', () => {
  test('increments from 0 to 1 (default increment)', () => {
    expect(incrementCounter(0)).toBe(1);
  });

  test('increments from 5 to 6 (default increment)', () => {
    expect(incrementCounter(5)).toBe(6);
  });

  test('increments by a custom amount', () => {
    expect(incrementCounter(10, 5)).toBe(15);
  });

  test('increments by zero (no change)', () => {
    expect(incrementCounter(7, 0)).toBe(7);
  });

  test('works with negative numbers', () => {
    expect(incrementCounter(3, -1)).toBe(2);
  });
});
