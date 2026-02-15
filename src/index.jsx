import React, { useCallback } from 'react';
import './style.css';

export default function Mathexpressioneditor(props) {
  const { updateData, data, emitOnClick, emitOnChange } = props;
  const value = data?.value ?? 0;

  const onClick = useCallback(() => {
    updateData({ value: value + 1 });
    emitOnClick();
  }, [value, updateData]);


  return (
    <button className="math-expression-editor" onClick={onClick}>
      Button is {value}
    </button>
  );
}