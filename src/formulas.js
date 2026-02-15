const FORMULAS = [
  {
    name: 'SUM',
    description: 'Returns the sum of numbers.',
    signature: 'SUM(number1, number2, ...)',
    params: [
      { name: 'number1', type: 'Number' },
      { name: 'number2', type: 'Number' },
    ],
  },
  {
    name: 'SUBTRACT',
    description: 'Returns the difference of two numbers.',
    signature: 'SUBTRACT(number1, number2)',
    params: [
      { name: 'number1', type: 'Number' },
      { name: 'number2', type: 'Number' },
    ],
  },
  {
    name: 'MULTIPLY',
    description: 'Returns the product of two numbers.',
    signature: 'MULTIPLY(number1, number2)',
    params: [
      { name: 'number1', type: 'Number' },
      { name: 'number2', type: 'Number' },
    ],
  },
  {
    name: 'DIVIDE',
    description: 'Returns the quotient of two numbers.',
    signature: 'DIVIDE(dividend, divisor)',
    params: [
      { name: 'dividend', type: 'Number' },
      { name: 'divisor', type: 'Number' },
    ],
  },
  {
    name: 'MIN',
    description: 'Returns the smallest value from a set of numbers.',
    signature: 'MIN(number1, number2, ...)',
    params: [
      { name: 'number1', type: 'Number' },
      { name: 'number2', type: 'Number' },
    ],
  },
  {
    name: 'MAX',
    description: 'Returns the largest value from a set of numbers.',
    signature: 'MAX(number1, number2, ...)',
    params: [
      { name: 'number1', type: 'Number' },
      { name: 'number2', type: 'Number' },
    ],
  },
  {
    name: 'ABS',
    description: 'Returns the absolute value of a number.',
    signature: 'ABS(number)',
    params: [{ name: 'number', type: 'Number' }],
  },
  {
    name: 'ROUND',
    description: 'Rounds a number to a specified number of digits.',
    signature: 'ROUND(number, num_digits)',
    params: [
      { name: 'number', type: 'Number' },
      { name: 'num_digits', type: 'Number' },
    ],
  },
];

export default FORMULAS;
