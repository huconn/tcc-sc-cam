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
  const debugShowLayoutBorders = useCameraStore((s: any) => s.debugShowLayoutBorders ?? false);
  
  return (
    <div 
      className={`bg-gray-800 border-2 ${borderColor} ${textColor} rounded-lg p-3 w-full relative mb-4 ${debugShowLayoutBorders ? 'debug' : ''}`} 
      id={`i2c-${mipiType}-block`}
    >
      {debugShowLayoutBorders && (
        <span className="absolute -top-3 -left-3 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">I2C-{mipiType.toUpperCase()}</span>
      )}
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
