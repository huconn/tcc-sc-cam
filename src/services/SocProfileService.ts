import type { DtsMap } from '@/types/dts';

export interface SocProfile {
  name: string;
  modules: {
    [key: string]: {
      enabled: boolean;
      uiComponent: string;
      mappingRules: string;
      dataModel: string;
    }
  };
}

/**
 * SoC 프로파일 서비스
 * SoC 타입 감지 및 프로파일 로드
 */
export class SocProfileService {
  private static profiles: any;

  /**
   * 프로파일 로드
   */
  static async loadProfiles(): Promise<void> {
    const response = await fetch('/config/soc-profiles.json');
    this.profiles = await response.json();
  }

  /**
   * DTS JSON에서 SoC 타입 감지
   */
  static detectSocType(dtsMap: DtsMap): string {
    // 루트 노드의 compatible 속성에서 SoC 타입 추출
    const rootNode = dtsMap.nodes.find(n => n.path === '/');
    const compatible = String(rootNode?.props?.compatible || '').toLowerCase();
    
    if (compatible.includes('tcc807') || compatible.includes('807')) {
      return 'tcc807x';
    } else if (compatible.includes('tcc805') || compatible.includes('805')) {
      return 'tcc805x';
    }
    
    // 기본값
    return 'tcc807x';
  }

  /**
   * SoC 타입에 따른 프로파일 가져오기
   */
  static getProfile(socType: string): SocProfile | undefined {
    if (!this.profiles) {
      throw new Error('Profiles not loaded. Call loadProfiles() first.');
    }
    return this.profiles.profiles[socType];
  }

  /**
   * 특정 모듈의 매핑 규칙 로드
   */
  static async loadMappingRules(socType: string, module: string): Promise<any> {
    const profile = this.getProfile(socType);
    if (!profile || !profile.modules[module]) {
      throw new Error(`Module ${module} not found for SoC ${socType}`);
    }
    
    const mappingRulesPath = profile.modules[module].mappingRules;
    const response = await fetch(mappingRulesPath);
    return await response.json();
  }

  /**
   * 활성화된 모듈 목록 가져오기
   */
  static getEnabledModules(socType: string): string[] {
    const profile = this.getProfile(socType);
    if (!profile) return [];
    
    return Object.entries(profile.modules)
      .filter(([_, config]) => (config as any).enabled)
      .map(([name, _]) => name);
  }
}
