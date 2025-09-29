import React from 'react';
import { useCameraStore } from '@/store/cameraStore';

interface I2CConfigBlockProps {
  mipiType: 'mipi0' | 'mipi1';
  borderColor: string;
  textColor: string;
  i2cValue: number;
  onI2CChange: (value: number) => void;
  disabledValues?: number[];
}

export const I2CConfigBlock: React.FC<I2CConfigBlockProps> = ({
  mipiType,
  borderColor,
  textColor,
  i2cValue,
  onI2CChange,
  disabledValues = []
}) => {
  return (
    <div 
      className={`bg-gray-800 border-2 ${borderColor} rounded-lg p-3 w-[140px] relative mb-4`} 
      id={`i2c-${mipiType}-block`}
    >
      <div className="space-y-2">
        <div>
          <select
            className="w-full text-xs bg-gray-600 text-gray-200 border border-gray-500 rounded px-1 py-0.5 font-bold"
            value={i2cValue}
            onChange={(e) => onI2CChange(parseInt(e.target.value))}
          >
            {Array.from({ length: 16 }).map((_, n) => (
              <option 
                key={n} 
                value={n} 
                disabled={disabledValues.includes(n)} 
                className="bg-gray-700 text-gray-200"
              >
                {`I2C${n}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
