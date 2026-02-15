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

const DUMMY_VARIABLES = [
  { id: 'x_opc', name: 'x_opc', type: 'Number' },
  { id: 'x_ppc', name: 'x_ppc', type: 'Number' },
  { id: 's_opc', name: 's_opc', type: 'Number' },
  { id: 'street_address', name: 'street_address', type: 'String' },
  { id: 'quantity', name: 'quantity', type: 'Number' },
  { id: 'unit_price', name: 'unit_price', type: 'Number' },
];

const DUMMY_EXPRESSION =
  'SUM({{ x_opc }}, {{ x_ppc }}) - 0.002 * SUM(2 * {{ x_opc }}, 1.5 * {{ x_ppc }}) + 0.5 * {{ s_opc }}';

export default function MathExpressionEditor(props) {
  const { data, emitOnChange } = props;
  const { expression = DUMMY_EXPRESSION, readonly = false, variables = DUMMY_VARIABLES } = data || {};

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
      <Editor expression={expression} variables={variables} onChange={handleChange} />
    </div>
  );
}
