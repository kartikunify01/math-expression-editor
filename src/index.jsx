import React, { useCallback, useMemo } from 'react';
import Editor from './Editor';
import ReadonlyView from './ReadonlyView';
import './style.css';

function getParentFont() {
  try {
    if (window.self !== window.top && window.top?.document?.body) {
      return window.top.getComputedStyle(window.top.document.body).fontFamily;
    }
  } catch (_) {}
  return undefined;
}

function normalizeVariables(variables) {
  if (!variables) return [];
  return variables.map((v) => ({
    id: v.id,
    name: v.properties?.name ?? v.id,
    type: v.properties?.type ?? 'Variable',
  }));
}

export default function MathExpressionEditor(props) {
  const { data, emitOnChange } = props;
  const { expression = '', readonly = false, variables: rawVariables, placeholder } = data || {};
  const variables = useMemo(() => normalizeVariables(rawVariables), [rawVariables]);

  const rootStyle = useMemo(() => ({ fontFamily: getParentFont() }), []);

  const handleChange = useCallback(
    (newExpression, variableIds) => {
      emitOnChange?.({ expression: newExpression, variableIds });
    },
    [emitOnChange],
  );

  if (readonly) {
    return (
      <div style={rootStyle}>
        <ReadonlyView expression={expression} variables={variables} />
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <Editor expression={expression} variables={variables} onChange={handleChange} placeholder={placeholder} />
    </div>
  );
}
