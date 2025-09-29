import React from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { I2CConfigBlock } from './I2CConfigBlock';

interface I2CPanelProps {
  shouldShowMipi0: boolean;
  shouldShowMipi1: boolean;
}

export const I2CPanel: React.FC<I2CPanelProps> = ({
  shouldShowMipi0,
  shouldShowMipi1
}) => {
  const i2cMain = useCameraStore((s: any) => s.i2cMain ?? 12);
  const i2cSub = useCameraStore((s: any) => s.i2cSub ?? 13);
  const setI2cMain = useCameraStore((s: any) => s.setI2cMain ?? (() => {}));
  const setI2cSub = useCameraStore((s: any) => s.setI2cSub ?? (() => {}));

  return (
    <div className="flex flex-col">
      {/* I2C Block for MIPI0 */}
      {shouldShowMipi0 && (
        <I2CConfigBlock
          mipiType="mipi0"
          borderColor="border-blue-500"
          textColor="text-blue-400"
          i2cValue={i2cMain}
          onI2CChange={setI2cMain}
          disabledValues={[i2cSub]}
        />
      )}

      {/* I2C Block for MIPI1 */}
      {shouldShowMipi1 && (
        <I2CConfigBlock
          mipiType="mipi1"
          borderColor="border-green-500"
          textColor="text-green-400"
          i2cValue={i2cSub}
          onI2CChange={setI2cSub}
          disabledValues={[i2cMain]}
        />
      )}
    </div>
  );
};
