import React, { useState, useEffect } from 'react';
import { Camera, Cpu, Zap, ChevronRight, Play } from 'lucide-react';

interface ConfigurationSelectorProps {
  onSelect: (soc: string, module: string) => void;
}

interface SocProfile {
  name: string;
  enabled: boolean;
  modules: {
    [key: string]: {
      enabled: boolean;
      uiComponent: string;
      mappingRules: string;
      dataModel: string;
    };
  };
}

interface ProfileData {
  version: string;
  description: string;
  defaultModule: string;
  profiles: {
    [key: string]: SocProfile;
  };
}

export const ConfigurationSelector: React.FC<ConfigurationSelectorProps> = ({ onSelect }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [selectedSoc, setSelectedSoc] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const totalTime = 3000; // 3초

  // Load soc-profiles.json
  useEffect(() => {
    fetch('/config/soc-profiles.json')
      .then(res => res.json())
      .then((data: ProfileData) => {
        setProfileData(data);
        
        // 첫 번째 활성화된 SoC 자동 선택
        const firstEnabledSoc = Object.entries(data.profiles).find(
          ([_, profile]) => profile.enabled
        )?.[0];
        
        if (firstEnabledSoc) {
          setSelectedSoc(firstEnabledSoc);
          
          // 해당 SoC의 첫 번째 활성화된 모듈 자동 선택
          const firstEnabledModule = Object.entries(data.profiles[firstEnabledSoc].modules).find(
            ([_, module]) => module.enabled
          )?.[0];
          
          if (firstEnabledModule) {
            setSelectedModule(firstEnabledModule);
          }
        }
      })
      .catch(err => console.error('Failed to load soc-profiles.json:', err));
  }, []);

  // 자동 실행 타이머
  useEffect(() => {
    if (!profileData || userInteracted) return;

    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressTimer);
        handleStart();
      }
    }, 50);

    return () => clearInterval(progressTimer);
  }, [profileData, userInteracted, selectedSoc, selectedModule]);

  const handleStart = () => {
    if (selectedSoc && selectedModule) {
      setProgress(100); // 프로그레스 바 즉시 완료
      setUserInteracted(true); // 사용자 선택으로 간주
      onSelect(selectedSoc, selectedModule);
    }
  };

  const handleSocClick = (socKey: string, isEnabled: boolean) => {
    if (!isEnabled) return; // 비활성화된 SoC는 선택 불가
    
    setUserInteracted(true); // 활성화된 항목 클릭 시에만 상호작용 인식
    setSelectedSoc(socKey);
    
    // 선택된 SoC의 첫 번째 활성화된 모듈 자동 선택
    if (profileData) {
      const firstEnabledModule = Object.entries(profileData.profiles[socKey].modules).find(
        ([_, module]) => module.enabled
      )?.[0];
      
      if (firstEnabledModule) {
        setSelectedModule(firstEnabledModule);
      }
    }
  };

  const handleModuleClick = (moduleKey: string, isEnabled: boolean) => {
    if (!isEnabled) return; // 비활성화된 모듈은 선택 불가
    
    setUserInteracted(true); // 활성화된 항목 클릭 시에만 상호작용 인식
    setSelectedModule(moduleKey);
  };

  const getModuleIcon = (moduleKey: string) => {
    switch (moduleKey) {
      case 'camera': return Camera;
      case 'pin': return Cpu;
      case 'power': return Zap;
      default: return Camera;
    }
  };

  if (!profileData) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const socEntries = Object.entries(profileData.profiles);
  const currentModules = selectedSoc ? profileData.profiles[selectedSoc].modules : {};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="max-w-5xl w-full mx-4 p-8 bg-gray-900 rounded-lg border-2 border-gray-700 shadow-2xl">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Telechips SoC Configuration Tool
          </h1>
          <p className="text-gray-400 text-sm">Select SoC and Module to begin</p>
        </div>

        {/* 1. SoC 선택 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-300">1. Select SoC Platform</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {socEntries.map(([socKey, socProfile]) => {
              const isEnabled = socProfile.enabled;
              const isSelected = selectedSoc === socKey;
              
              return (
                <button
                  key={socKey}
                  onClick={() => handleSocClick(socKey, isEnabled)}
                  disabled={!isEnabled}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    transform hover:scale-105 active:scale-95
                    ${!isEnabled
                      ? 'border-gray-700 bg-gray-850 opacity-40 cursor-not-allowed hover:scale-100'
                      : isSelected
                      ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-gray-750 hover:shadow-md'
                    }
                  `}
                >
                  <Cpu className={`w-8 h-8 mb-2 ${
                    !isEnabled ? 'text-gray-600' : isSelected ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <h3 className={`font-semibold ${
                    !isEnabled ? 'text-gray-600' : isSelected ? 'text-blue-300' : 'text-gray-300'
                  }`}>
                    {socKey.toUpperCase()}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    !isEnabled ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    {socProfile.name}
                  </p>
                  {!isEnabled && (
                    <span className="inline-block mt-2 text-xs text-gray-600">Coming Soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 모듈 선택 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-300">2. Select Configuration Module</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(currentModules).map(([moduleKey, moduleConfig]) => {
              const IconComponent = getModuleIcon(moduleKey);
              const isEnabled = moduleConfig.enabled;
              const isSelected = selectedModule === moduleKey;

              return (
                <button
                  key={moduleKey}
                  onClick={() => handleModuleClick(moduleKey, isEnabled)}
                  disabled={!isEnabled}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    transform hover:scale-105 active:scale-95
                    ${!isEnabled
                      ? 'border-gray-700 bg-gray-850 opacity-40 cursor-not-allowed hover:scale-100'
                      : isSelected
                      ? 'border-green-500 bg-green-600/20 shadow-lg shadow-green-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-green-400 hover:bg-gray-750 hover:shadow-md'
                    }
                  `}
                >
                  <IconComponent className={`w-8 h-8 mb-2 ${
                    !isEnabled ? 'text-gray-600' : isSelected ? 'text-green-400' : 'text-gray-400'
                  }`} />
                  <h3 className={`font-semibold capitalize ${
                    !isEnabled ? 'text-gray-600' : isSelected ? 'text-green-300' : 'text-gray-300'
                  }`}>
                    {moduleKey}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    !isEnabled ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    {isEnabled ? moduleConfig.dataModel : 'Not Available'}
                  </p>
                  {!isEnabled && (
                    <span className="inline-block mt-2 text-xs text-gray-600">Coming Soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Start 버튼 + 프로그레스 바 */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              {userInteracted ? (
                <>
                  Selected: <span className="text-blue-400 font-semibold">{selectedSoc.toUpperCase()}</span>
                  {' '}/{' '}
                  <span className="text-green-400 font-semibold capitalize">{selectedModule}</span>
                </>
              ) : (
                <>
                  Auto-starting in <span className="text-blue-400 font-semibold">{Math.ceil((100 - progress) / 33.33)}s</span>
                </>
              )}
            </div>
            <button
              onClick={handleStart}
              disabled={!selectedSoc || !selectedModule}
              className={`
                px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
                ${userInteracted
                  ? 'bg-blue-600 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50 text-white'
                  : 'bg-gray-700 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50 text-gray-400 hover:text-white cursor-wait'
                }
              `}
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          </div>

          {/* 프로그레스 바 */}
          {!userInteracted && (
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-50"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
