import React from 'react';

interface TimeframeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimeframeSelector = ({ value, onChange }: TimeframeSelectorProps) => {
  return (
    <div className="bg-blue-500 p-2">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="text-black p-1"
      >
        <option value="5m">5m</option>
        <option value="15m">15m</option>
        <option value="1h">1h</option>
      </select>
    </div>
  );
};