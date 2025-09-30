import type { MIPIChannel, ISPConfig, CameraMuxConfig, SVDWConfig } from '@/types/camera';

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation Service
 * 설정값 검증 담당
 */
export class ValidationService {
  /**
   * MIPI 채널 설정 검증
   */
  static validateMIPIChannel(channel: MIPIChannel): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 데이터 레인 수 검증
    if (channel.dataLanes < 1 || channel.dataLanes > 4) {
      errors.push({
        field: 'dataLanes',
        message: 'Data lanes must be between 1 and 4',
        code: 'INVALID_DATA_LANES'
      });
    }

    // 가상 채널 수 검증
    if (channel.virtualChannels < 1 || channel.virtualChannels > 4) {
      errors.push({
        field: 'virtualChannels',
        message: 'Virtual channels must be between 1 and 4',
        code: 'INVALID_VIRTUAL_CHANNELS'
      });
    }

    // HS Settle 값 검증
    if (channel.hsSettle < 0 || channel.hsSettle > 1000) {
      warnings.push({
        field: 'hsSettle',
        message: 'HS settle value should be between 0 and 1000',
        code: 'HS_SETTLE_RANGE_WARNING'
      });
    }

    // 픽셀 모드 검증
    if (!['1', '2', '3', '4'].includes(channel.pixelMode)) {
      errors.push({
        field: 'pixelMode',
        message: 'Pixel mode must be 1, 2, 3, or 4',
        code: 'INVALID_PIXEL_MODE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * ISP 설정 검증
   */
  static validateISPConfig(isp: ISPConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // CFA 값 검증
    if (isp.cfa < 0 || isp.cfa > 3) {
      errors.push({
        field: 'cfa',
        message: 'CFA value must be between 0 and 3',
        code: 'INVALID_CFA'
      });
    }

    // RGBIR CFA는 ISP1, ISP3에서만 지원
    if (isp.cfa === 3 && !['isp1', 'isp3'].includes(isp.id)) {
      errors.push({
        field: 'cfa',
        message: 'RGBIR CFA is only supported on ISP1 and ISP3',
        code: 'RGBIR_NOT_SUPPORTED'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 카메라 멀티플렉서 설정 검증
   */
  static validateCameraMux(mux: CameraMuxConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 매핑 중복 검증
    const outputMappings = new Set();
    const inputMappings = new Set();

    for (const mapping of mux.mappings) {
      if (outputMappings.has(mapping.output)) {
        errors.push({
          field: 'mappings',
          message: `Output ${mapping.output} is mapped to multiple inputs`,
          code: 'DUPLICATE_OUTPUT_MAPPING'
        });
      }
      outputMappings.add(mapping.output);

      if (inputMappings.has(mapping.input)) {
        warnings.push({
          field: 'mappings',
          message: `Input ${mapping.input} is mapped to multiple outputs`,
          code: 'DUPLICATE_INPUT_MAPPING'
        });
      }
      inputMappings.add(mapping.input);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 전체 설정 검증
   */
  static validateConfiguration(config: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // MIPI 채널 검증
    if (config.mipiChannels) {
      for (const channel of config.mipiChannels) {
        const result = this.validateMIPIChannel(channel);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    // ISP 설정 검증
    if (config.ispConfigs) {
      for (const isp of config.ispConfigs) {
        const result = this.validateISPConfig(isp);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      }
    }

    // 카메라 멀티플렉서 검증
    if (config.cameraMux) {
      const result = this.validateCameraMux(config.cameraMux);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
