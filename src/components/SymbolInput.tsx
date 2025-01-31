import React from 'react';

interface SymbolInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SymbolInput = ({ value, onChange }: SymbolInputProps) => {
  return (
    <div className="bg-red-500 p-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-black p-1"
      />
    </div>
  );
};