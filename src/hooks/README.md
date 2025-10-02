# Debug Toggle Hook

디버그 기능의 키보드 토글 동작을 간편하게 구현하는 재사용 가능한 Custom Hook입니다.

## 기능

- ✅ 키보드 단축키로 디버그 기능 토글
- ✅ Feature flag를 통한 활성화/비활성화 제어
- ✅ Store 자동 동기화 (선택적)
- ✅ 커스터마이징 가능한 키 조합 (Ctrl, Shift, Alt)
- ✅ 자동 디버깅 로그

## 사용법

### 기본 사용 (표시 상태만 관리)

```tsx
import { useDebugToggle } from '@/hooks/useDebugToggle';

const [visible] = useDebugToggle({
  key: 'D',                          // Ctrl+Shift+D
  featureEnabled: debugShowDtsMap,   // Store의 feature flag
  debugName: 'DTS Map'               // 로그에 표시될 이름
});

// 조건부 렌더링
{debugShowDtsMap && visible && <MyComponent />}
```

### Store 동기화 (모든 컴포넌트에 적용)

```tsx
import { useDebugToggle } from '@/hooks/useDebugToggle';

useDebugToggle({
  key: 'L',                               // Ctrl+Shift+L
  featureEnabled: debugShowLayoutBorders, // Store의 feature flag
  storeSetter: setDebugShowLayoutBorders, // Store setter 함수
  debugName: 'Layout Borders'
});

// 다른 컴포넌트에서 store 값 사용
{useCameraStore(s => s.debugShowLayoutBorders) && <Border />}
```

### 커스텀 키 조합

```tsx
useDebugToggle({
  key: 'R',
  featureEnabled: debugShowResolution,
  modifiers: {
    ctrl: true,   // Ctrl 키 필수
    shift: false, // Shift 키 불필요
    alt: true     // Alt 키 필수
  },
  debugName: 'Resolution Info'
});
// 단축키: Ctrl+Alt+R
```

## API

### `useDebugToggle(config: DebugToggleConfig)`

#### Parameters

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `key` | `string` | ✅ | - | 키보드 키 (대문자, 예: 'D', 'L') |
| `featureEnabled` | `boolean` | ✅ | - | Feature flag (store 값) |
| `storeSetter` | `(value: boolean) => void` | ❌ | - | Store setter 함수 |
| `modifiers` | `object` | ❌ | `{ctrl: true, shift: true}` | 키 조합 설정 |
| `debugName` | `string` | ✅ | - | 디버깅용 이름 |

#### Returns

`[visible, setVisible]` - 현재 표시 상태와 setter 함수

## 동작 원리

1. **Feature Flag 체크**: `featureEnabled`가 `false`이면 토글 불가
2. **키보드 이벤트**: 지정된 키 조합 감지
3. **Local State 토글**: `visible` 상태 변경
4. **Store 동기화**: `storeSetter`가 제공된 경우 자동 동기화
5. **디버그 로그**: 모든 동작을 콘솔에 출력

## 예제

### 예제 1: DTS Map 토글

```tsx
// App.tsx
const debugShowDtsMap = useCameraStore(s => s.debugShowDtsMap);

const [dtsMapVisible] = useDebugToggle({
  key: 'D',
  featureEnabled: debugShowDtsMap,
  debugName: 'DTS Map'
});

// 표시
{debugShowDtsMap && dtsMapVisible && <DtsMapPanel />}
```

**동작:**
- `debugShowDtsMap: false` → Ctrl+Shift+D 눌러도 토글 안 됨 ❌
- `debugShowDtsMap: true` → Ctrl+Shift+D로 토글 가능 ✅

### 예제 2: Layout Borders 토글 (전역 적용)

```tsx
// App.tsx
const debugShowLayoutBorders = useCameraStore(s => s.debugShowLayoutBorders);
const { setDebugShowLayoutBorders } = useCameraStore();

useDebugToggle({
  key: 'L',
  featureEnabled: debugShowLayoutBorders,
  storeSetter: setDebugShowLayoutBorders,
  debugName: 'Layout Borders'
});

// 다른 컴포넌트에서
// MainCoreView.tsx
const showBorders = useCameraStore(s => s.debugShowLayoutBorders);
<div className={showBorders ? 'debug-border' : ''}>
```

**동작:**
- `debugShowLayoutBorders: false` → Ctrl+Shift+L 토글 안 됨, 모든 컴포넌트에서 `false`
- `debugShowLayoutBorders: true` → Ctrl+Shift+L로 토글, 모든 컴포넌트에 자동 반영

### 예제 3: 새로운 디버그 기능 추가

```tsx
// 1. cameraStore.ts에 추가
export const useCameraStore = create<CameraStore>((set) => ({
  // ...
  debugShowPerformance: false,
  setDebugShowPerformance: (v) => set({ debugShowPerformance: v }),
}));

// 2. App.tsx에서 사용
const debugShowPerformance = useCameraStore(s => s.debugShowPerformance);
const { setDebugShowPerformance } = useCameraStore();

const [perfVisible] = useDebugToggle({
  key: 'P',                           // Ctrl+Shift+P
  featureEnabled: debugShowPerformance,
  storeSetter: setDebugShowPerformance,
  debugName: 'Performance Monitor'
});

{debugShowPerformance && perfVisible && <PerformanceMonitor />}
```

## 장점

1. **코드 재사용**: 반복되는 토글 로직을 한 번만 작성
2. **일관성**: 모든 디버그 기능이 동일한 패턴으로 동작
3. **확장성**: 새로운 디버그 기능 추가가 매우 쉬움
4. **유지보수**: 한 곳에서 로직 관리
5. **타입 안전성**: TypeScript로 작성되어 타입 체크 지원

## 콘솔 로그

토글 시 자동으로 다음과 같은 로그가 출력됩니다:

```
[DTS Map] Shortcut pressed. Feature enabled: true
[DTS Map] Toggling from true to false
[DTS Map] Synced to store: false
[DTS Map Debug] { featureEnabled: true, visible: false, shouldShow: false }
```

Feature가 비활성화된 경우:

```
[Layout Borders] Shortcut pressed. Feature enabled: false
[Layout Borders] Toggle blocked - feature is disabled
```

## 주의사항

1. **키 충돌 방지**: 다른 Hook과 동일한 키 조합을 사용하지 않도록 주의
2. **Feature Flag**: Store의 초기값이 feature를 제어하므로 배포 전 확인 필요
3. **Store Setter**: 전역 적용이 필요한 경우에만 `storeSetter` 제공

## 향후 개선 가능 사항

- [ ] 키바인딩 설정 파일로 관리
- [ ] 키 충돌 감지 및 경고
- [ ] 런타임에 키바인딩 변경 기능
- [ ] 키바인딩 목록 표시 UI (Help 화면)

