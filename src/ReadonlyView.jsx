import React, { useMemo } from 'react';
import { parseExpressionTokens } from './expressionUtils';

const S = {
  root: {
    minHeight: 20,
    wordBreak: 'break-word',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: '20px',
    fontWeight: 400,
    fontFamily: 'inherit',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#F7F7F7',
    color: '#424242',
    borderRadius: 6,
    padding: '4px 8px 4px 6px',
    margin: '0 2px',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
  },
  fn: {
    color: '#1570EF',
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default function ReadonlyView({ expression, variables }) {
  const tokens = useMemo(
    () => parseExpressionTokens(expression, variables),
    [expression, variables],
  );

  return (
    <div style={S.root}>
      {tokens.map((token, i) => {
        if (token.type === 'variable') {
          return (
            <span key={i} style={S.pill}>
              {token.name}
            </span>
          );
        }
        if (token.type === 'function') {
          return (
            <span key={i} style={S.fn}>
              {token.value}
            </span>
          );
        }
        return <span key={i}>{token.value}</span>;
      })}
    </div>
  );
}
