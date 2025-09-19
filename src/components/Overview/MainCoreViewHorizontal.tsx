import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Monitor, 
  AlertCircle, 
  MoreHorizontal,
  Zap,
  Cpu,
  Network,
  Settings,
  Eye,
  Layers,
  Activity,
  Wifi,
  HardDrive,
  Video,
  Image,
  Filter,
  ArrowRight,
  ArrowDown,
  Circle,
  Square,
  Triangle,
  Hexagon
} from 'lucide-react';
import { useCameraStore } from '@/store/cameraStore';
import { ISPConfigModal } from '@/components/ISPConfiguration/ISPConfigModal';
import { ISPSelector, ChannelMode as SelectorChannelMode } from '@/components/ISPConfiguration/ISPSelector';
import { channelHex as CHANNEL_HEX, channelBgClass as CHANNEL_BG, getChannelHex, getChannelBgClass } from '@/utils/channelPalette';
import { MIPIChannelConfigModal } from './MIPIChannelConfigModal';
import { CameraMuxConfigModal } from '../CameraMux/CameraMuxConfigModal';
import { CameraMuxBlock } from '@/components/CameraMux/CameraMuxBlock';
import { SVDWBlock } from '@/components/SVDW/SVDWBlock';
import { VideoOutputsSection } from '@/components/VideoPipeline/VideoOutputsSection';
import { CIEDBar } from '@/components/CIED/CIEDBar';

interface MainCoreViewHorizontalProps {
  selectedDevices: {
    mipi0: string[];
    mipi1: string[];
  };
  externalDevices?: {
    mipi0: any | any[];
    mipi1: any | any[];
  };
  onDeviceClick: (mipi: 'mipi0' | 'mipi1') => void;
}

// Device type colors mapping
const deviceTypeColors: Record<string, string> = {
  sensor: 'bg-orange-500',
  serializer: 'bg-blue-500',
  deserializer: 'bg-purple-500',
  converter: 'bg-yellow-500',
  soc: 'bg-red-500'
};

type ChannelMode = 'isp0' | 'isp1' | 'isp2' | 'isp3' | 'bypass';

interface ISPConfig {
  cfa: number;
  sharedMemory: boolean;
}

export const MainCoreViewHorizontal: React.FC<MainCoreViewHorizontalProps> = ({
  selectedDevices,
  externalDevices,
  onDeviceClick
}) => {
  const viewMode = useCameraStore(state => state.viewMode);
  const rightColRef = useRef<HTMLDivElement>(null);
  const rightGroupRef = useRef<HTMLDivElement>(null);
  const group1Ref = useRef<HTMLDivElement>(null);
  const camMuxRef = useRef<HTMLDivElement>(null);
  const [ciedTopOffset, setCiedTopOffset] = useState<number>(0);
  const ciedRef = useRef<HTMLDivElement>(null);
  const [paddingBottom, setPaddingBottom] = useState<number>(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const selectorsRef = useRef<HTMLDivElement>(null);
  const extColRef = useRef<HTMLDivElement>(null);
  const videoGroupRef = useRef<HTMLDivElement>(null);
  const [videoGroupTopOffset, setVideoGroupTopOffset] = useState<number>(0);
  const svdwRef = useRef<HTMLDivElement>(null);
  const [extMipi1Top, setExtMipi1Top] = useState<number | null>(null);
  const [selectorsHeight, setSelectorsHeight] = useState<number>(400);
  const [camToSvdw, setCamToSvdw] = useState<{x1:number;y1:number;x2:number;y2:number}|null>(null);
  const [camToSvdwLines, setCamToSvdwLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string;arrow?:boolean}>>([]);
  const [camToCiedLines, setCamToCiedLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string;hasStartDot?:boolean}>>([]);
  const [muxToMipi, setMuxToMipi] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string}>>([]);
  const [chToIspLines, setChToIspLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string}>>([]);
  const [ispToLLines, setIspToLLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string}>>([]);
  const [externalToMipiLines, setExternalToMipiLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string}>>([]);
  const [selectorTopOverrides, setSelectorTopOverrides] = useState<Record<number, number>>({});
  const forceHorizontalOutputs = useCameraStore(s => s.debugMainCoreViewHorizontalForceOutputs ?? false);
  // Read each field separately to avoid creating a new snapshot object every render
  const i2cMain = useCameraStore((s: any) => s.i2cMain ?? 12);
  const i2cSub = useCameraStore((s: any) => s.i2cSub ?? 13);
  const setI2cMain = useCameraStore((s: any) => s.setI2cMain ?? (() => {}));
  const setI2cSub = useCameraStore((s: any) => s.setI2cSub ?? (() => {}));

  // Compute Camera Mux R0/R1/R2/R3 -> SVDW 1-1/2-1/3-1/4-1 connections
  const computeCamMuxToSvdw = () => {
    const pairs = [
      { from: 'mux-right-0-target', fallback: 'mux-right-0', to: 'svdw-left-0', arrow: true }, // R0 -> 1-1
      { from: 'mux-right-1-target', fallback: 'mux-right-1', to: 'svdw-left-1', arrow: true }, // R1 -> 2-1
      { from: 'mux-right-2-target', fallback: 'mux-right-2', to: 'svdw-left-2', arrow: true }, // R2 -> 3-1
      { from: 'mux-right-3-target', fallback: 'mux-right-3', to: 'svdw-left-3', arrow: true }, // R3 -> 4-1
      { from: 'mux-right-4-target', fallback: 'mux-right-4', to: 'video-out-vwdma0', arrow: true }, // R4 -> VWDMA0
      { from: 'mux-right-5-target', fallback: 'mux-right-5', to: 'video-out-vwdma1', arrow: true }, // R5 -> VWDMA1
      { from: 'mux-right-6-target', fallback: 'mux-right-6', to: 'video-out-vin0', arrow: true }, // R6 -> VIN0 (arrow)
      { from: 'mux-right-7-target', fallback: 'mux-right-7', to: 'video-out-vin1', arrow: true }, // R7 -> VIN1 (arrow)
    ];
    const collected: Array<{x1:number;y1:number;x2:number;y2:number;color:string;arrow?:boolean}> = [];
    pairs.forEach(p => {
      const camTarget = document.querySelector(`[data-connection-point="${p.from}"]`) as HTMLElement | null;
      const camBox = document.querySelector(`[data-connection-point="${p.fallback}"]`) as HTMLElement | null;
      const camEl = camTarget || camBox;
      const svdw = document.querySelector(`[data-connection-point="${p.to}"]`) as HTMLElement | null;
      if (camEl && svdw) {
        // Start from the RIGHT edge of the Camera Mux right marker box (if available), else the target element
        const camRectBase = (camBox?.getBoundingClientRect()) || camEl.getBoundingClientRect();
        const svdwRect = svdw.getBoundingClientRect();
        const x1 = camRectBase.left + camRectBase.width; // right edge
        const y1 = camRectBase.top + camRectBase.height / 2;
        const x2 = svdwRect.left;
        let y2 = svdwRect.top + svdwRect.height / 2;
        if (forceHorizontalOutputs) {
          // Force horizontal by aligning destination Y to source Y
          y2 = y1;
        }
        const match = p.from.match(/mux-right-(\d+)/);
        const idx = match ? parseInt(match[1], 10) : 0;
        const color = channelColors[idx] || '#93c5fd';
        collected.push({ x1, y1, x2, y2, color, arrow: p.arrow });
      }
    });
    setCamToSvdwLines(collected);
    // Keep backward-compat single line for any consumers
    setCamToSvdw(collected[0] || null);
  };

  // Camera Mux R0..R7 -> CIED 0..7 (slot buttons)
  // Start from the MIDPOINT of the corresponding SVDW/Video line, then go vertically to CIED
  const computeCamMuxToCied = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string;hasStartDot?:boolean}> = [];
    const targetByIndex: Record<number, string> = {
      0: 'svdw-left-0',
      1: 'svdw-left-1',
      2: 'svdw-left-2',
      3: 'svdw-left-3',
      4: 'video-out-vwdma0',
      5: 'video-out-vwdma1',
      6: 'video-out-vin0',
      7: 'video-out-vin1'
    };
    for (let i = 0; i < 8; i += 1) {
      const fromTarget = document.querySelector(`[data-connection-point="mux-right-${i}-target"]`) as HTMLElement | null;
      const fromFallback = document.querySelector(`[data-connection-point="mux-right-${i}"]`) as HTMLElement | null;
      const fromEl = fromTarget || fromFallback;
      const toCied = document.querySelector(`[data-connection-point="cied-slot-${i}"]`) as HTMLElement | null;
      const toRight = document.querySelector(`[data-connection-point="${targetByIndex[i]}"]`) as HTMLElement | null;
      if (!fromEl || !toCied || !toRight) continue;

      const a = (fromFallback?.getBoundingClientRect()) || fromEl.getBoundingClientRect();
      const r = toRight.getBoundingClientRect();
      const b = toCied.getBoundingClientRect();

      // Line from R{i} right edge to target left center (optionally forced horizontal)
      const xStart = a.left + a.width;
      let yStart = a.top + a.height / 2;
      const xEnd = r.left;
      let yEnd = r.top + r.height / 2;
      if (forceHorizontalOutputs) {
        yEnd = yStart; // force horizontal baseline for OUT -> target
      }

      // Align X to the CIED slot center so each channel has unique x and doesn't overlap
      const ciedCenterX = b.left + b.width / 2;

      // Compute intersection Y at x=ciedCenterX along the R{i}->target segment (clamped)
      let yIntersect = (yStart + yEnd) / 2; // fallback
      if (xEnd !== xStart) {
        const t = (ciedCenterX - xStart) / (xEnd - xStart);
        const tClamped = Math.max(0, Math.min(1, t));
        yIntersect = yStart + tClamped * (yEnd - yStart);
      }

      const x1 = ciedCenterX; // start aligned to CIED x
      const y1 = yIntersect;  // start on the actual line at that x
      const x2 = ciedCenterX; // vertical up to CIED top
      const y2 = b.top;

      lines.push({ x1, y1, x2, y2, color: channelColors[i], hasStartDot: true });
    }
    setCamToCiedLines(lines);
  };

  // 1) CHi -> ISPi (CH right edge to ISP left edge)
  const computeMipiToIsp = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string}> = [];

    // mipi0: CHi -> ISPi (only if shouldShowMipi0)
    if (shouldShowMipi0) {
      for (let i = 0; i < 4; i += 1) {
        //console.log(`mipi0-ch${i}`, `isp${i}-box`);
        const ch = document.querySelector(`[data-anchor="mipi0-ch${i}"]`) as HTMLElement | null;
        const isp = document.querySelector(`[data-connection-point="isp-left-${i}-box"]`) as HTMLElement | null;
        if (!ch || !isp) continue;
        //onsole.log(ch, isp);
        const a = ch.getBoundingClientRect();
        const b = isp.getBoundingClientRect();
        lines.push({
          x1: a.left + a.width,
          y1: a.top + a.height / 2,
          x2: b.left,
          y2: b.top + b.height / 2,
          color: channelColors[i]
        });
      }
    }
    // mipi1: CHi -> ISP(i+4) (always compute, regardless of viewMode)
    for (let i = 0; i < 4; i += 1) {
      //console.log(`mipi1-ch${i}`, `isp${i + 4}-box`);
      
      const ch = document.querySelector(`[data-anchor=\"mipi1-ch${i}\"]`) as HTMLElement | null;
      const isp = document.querySelector(`[data-connection-point=\"isp-left-${i + 4}-box\"]`) as HTMLElement | null;
      if (!ch || !isp) continue;
      //console.log(ch, isp);
      const a = ch.getBoundingClientRect();
      const b = isp.getBoundingClientRect();
      lines.push({
        x1: a.left + a.width,
        y1: a.top + a.height / 2,
        x2: b.left,
        y2: b.top + b.height / 2,
        color: channelColors[i + 4]
      });
    }
    setChToIspLines(lines);
  };

  // ISP right edge to Camera Mux left edge
  const computeIspToCamMux = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string}> = [];
    // isp0..3 -> L0..3 (only if shouldShowMipi0)
    if (shouldShowMipi0) {
      for (let i = 0; i < 4; i += 1) {
        //console.log(`isp-right-${i}-box`, `mux-left-${i}`);
        const isp = document.querySelector(`[data-anchor-point="isp-right-${i}-box"]`) as HTMLElement | null;
        const l = document.querySelector(`[data-connection-point="mux-left-${i}-target"]`) as HTMLElement | null;
        if (!isp || !l) continue;
        const a = isp.getBoundingClientRect();
        const b = l.getBoundingClientRect();
        lines.push({
          x1: a.left + a.width,
          y1: a.top + a.height / 2,
          x2: b.left,
          y2: b.top + b.height / 2,
          color: channelColors[i]
        });
      }
    }
    // isp4..7 -> L4..7 (always compute, regardless of viewMode)
    for (let i = 0; i < 4; i += 1) {
      const ispIdx = i + 4;
      //console.log(`isp-right-${ispIdx}-box`, `mux-left-${ispIdx}`);
      const isp = document.querySelector(`[data-anchor-point=\"isp-right-${ispIdx}-box\"]`) as HTMLElement | null;
      const l = document.querySelector(`[data-connection-point=\"mux-left-${ispIdx}-target\"]`) as HTMLElement | null;
      if (!isp || !l) continue;
      const a = isp.getBoundingClientRect();
      const b = l.getBoundingClientRect();
      lines.push({
        x1: a.left + a.width,
        y1: a.top + a.height / 2,
        x2: b.left,
        y2: b.top + b.height / 2,
        color: channelColors[ispIdx]
      });
    }
    setIspToLLines(lines);
  };

  // External devices to MIPI connection lines
  const computeExternalToMipi = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string}> = [];
    
    // Find MIPI0 and MIPI1 boxes
    const mipi0Box = document.querySelector('#mipi0-block') as HTMLElement | null;
    const mipi1Box = document.querySelector('#mipi1-block') as HTMLElement | null;
    
    // MIPI0 line: from top External Devices block
    if (mipi0Box) {
      const topExtDevice = document.querySelector('[data-connection-point="ext-device-top"]') as HTMLElement | null;
      if (topExtDevice) {
        const extRect = topExtDevice.getBoundingClientRect();
        const extRightEdge = extRect.left + extRect.width;
        const extCenterY = extRect.top + extRect.height / 2;
        
        const mipi0Rect = mipi0Box.getBoundingClientRect();
        // Keep horizontal line - use same Y as External device
        lines.push({
          x1: extRightEdge,
          y1: extCenterY,
          x2: mipi0Rect.left,
          y2: extCenterY, // Keep horizontal - same Y as start point
          color: '#93c5fd' // light blue
        });
      }
    }
    
    // MIPI1 line: from bottom External Devices block
    if (mipi1Box) {
      const bottomExtDevice = document.querySelector('[data-connection-point="ext-device-bottom"]') as HTMLElement | null;
      if (bottomExtDevice) {
        const extRect = bottomExtDevice.getBoundingClientRect();
        const extRightEdge = extRect.left + extRect.width;
        const extCenterY = extRect.top + extRect.height / 2;
        
        const mipi1Rect = mipi1Box.getBoundingClientRect();
        // Keep horizontal line - use same Y as External device
        lines.push({
          x1: extRightEdge,
          y1: extCenterY,
          x2: mipi1Rect.left,
          y2: extCenterY, // Keep horizontal - same Y as start point
          color: '#86efac' // light green
        });
      }
    }
    
    setExternalToMipiLines(lines);
  };

  useEffect(() => {
    const updateOnce = () => {
      const h = rightColRef.current?.getBoundingClientRect().height || 0;
      const top = h + 8;
      setCiedTopOffset(top);
      // Match selectors container (4) height to CameraMux (5)
      try {
        const camMuxH = camMuxRef.current?.getBoundingClientRect().height;
        if (camMuxH && camMuxH > 0) setSelectorsHeight(Math.round(camMuxH));
      } catch {}
      const legendH = legendRef.current?.getBoundingClientRect().height || 80;
      setPaddingBottom(legendH + 8);

      //cam mux0,1,2,3 to svdw1,2,3,4
      computeCamMuxToSvdw();

      //mipi0,1 to isp0,1,2,3,4,5,6,7
      computeMipiToIsp();

      //isp0,1,2,3,4,5,6,7 to cam mux0,1,2,3
      computeIspToCamMux();

      //cam mux0..7 to cied0..7
      computeCamMuxToCied();

      //external devices to mipi0, mipi1
      computeExternalToMipi();

      // Align ISP0 selector center with Camera Mux IN-0 (mux-left-0) center
      try {
        const l0 = document.querySelector('[data-connection-point="mux-left-0-target"]') as HTMLElement | null;
        if (l0 && selectorsRef.current) {
          const l0Rect = l0.getBoundingClientRect();
          const selRect = selectorsRef.current.getBoundingClientRect();
          const isp0Wrap = document.querySelector('[data-connection-point="isp-left-0-box"]') as HTMLElement | null;
          const isp0Height = isp0Wrap ? isp0Wrap.getBoundingClientRect().height : 0;
          const l0CenterY = l0Rect.top + l0Rect.height / 2;
          const top = Math.round(l0CenterY - selRect.top - (isp0Height / 2));
          setSelectorTopOverrides(prev => ({ ...prev, 0: top }));
        }
      } catch {}

      // Align second External Devices panel top to MIPI1 block top using DOM coordinates
      try {
        const mipi1 = document.getElementById('mipi1-block');
        if (mipi1 && extColRef.current) {
          const mipi1Rect = mipi1.getBoundingClientRect();
          const extColRect = extColRef.current.getBoundingClientRect();
          const offset = Math.max(0, Math.round(mipi1Rect.top - extColRect.top));
          setExtMipi1Top(offset);
        }
      } catch {}

      // Align SVDW (right column top) with Camera Mux top
      try {
        if (camMuxRef.current && rightColRef.current) {
          const camRect = camMuxRef.current.getBoundingClientRect();
          const rightRect = rightColRef.current.getBoundingClientRect();
          const offset = Math.max(0, Math.round(camRect.top - rightRect.top));
          setRightColTopOffset(offset);
        }
      } catch {}

      // Align video group (6-3) bottom to Camera Mux BOX bottom by setting its top offset inside right column
      try {
        const camBox = document.querySelector('[data-connection-point="camera-mux-box"]') as HTMLElement | null;
        if (camBox && rightColRef.current && videoGroupRef.current) {
          const camRect = camBox.getBoundingClientRect();
          const rightRect = rightColRef.current.getBoundingClientRect();
          const vgRect = videoGroupRef.current.getBoundingClientRect();
          const svdwHeight = svdwRef.current ? svdwRef.current.getBoundingClientRect().height : 0;
          // desiredTop is distance from rightCol top to place vg top so that vg bottom == cam bottom
          const desiredTop = Math.max(0, Math.round(camRect.bottom - rightRect.top - vgRect.height));
          // Since vg is after SVDW in normal flow, apply only the extra margin needed beyond SVDW height
          const marginTop = Math.max(0, desiredTop - svdwHeight);
          setVideoGroupTopOffset(marginTop);
        }
      } catch {}

      // Align CIED bottom to container 1 bottom (relative to its positioned parent 6)
      try {
        if (ciedRef.current && group1Ref.current && rightGroupRef.current) {
          const groupRect = group1Ref.current.getBoundingClientRect();
          const rightGroupRect = rightGroupRef.current.getBoundingClientRect();
          const ciedRect = ciedRef.current.getBoundingClientRect();
          // Ensure the right-side group (6) has the same height as container 1 so bottom:0 aligns correctly
          (rightGroupRef.current as HTMLDivElement).style.height = `${Math.round(groupRect.height)}px`;
          // 강제 보정: CEID 하단을 1번 컨테이너 하단에 맞추고, CEID 높이만큼 위로 올림
          // Raise slightly above by 8px to visually align with border thickness
          const desiredTop = Math.round((groupRect.top + groupRect.height) - ciedRect.height - rightGroupRect.top - 20);
          ciedRef.current.style.top = `${desiredTop}px`;
        }
      } catch {}
    };
    const update = () => requestAnimationFrame(updateOnce);
    update();
    const ro = new ResizeObserver(update);
    if (rightColRef.current) ro.observe(rightColRef.current);
    if (legendRef.current) ro.observe(legendRef.current as Element);
    if (mainRef.current) ro.observe(mainRef.current);
    // Observe DOM mutations around anchors to force line recompute when elements move/appear
    const mo = new MutationObserver(() => requestAnimationFrame(updateOnce));
    if (mainRef.current) {
      mo.observe(mainRef.current, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-connection-point', 'data-anchor', 'class', 'style']
      });
    }
    if (document.body) {
      mo.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-connection-point', 'data-anchor', 'class', 'style']
      });
    }
    // Also watch the entire document body since overlay uses viewport coords
    ro.observe(document.body as Element);
    window.addEventListener('resize', update);
    // Recompute on scroll so lines follow when the view is reduced or scrolled
    window.addEventListener('scroll', update, true);
    if (mainRef.current) {
      mainRef.current.addEventListener('scroll', update, { passive: true } as any);
    }
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      if (mainRef.current) {
        try { mainRef.current.removeEventListener('scroll', update as any); } catch {}
      }
    };
  }, []);

  // Also recompute frequently for a short period to reflect layout settling without refresh
  useEffect(() => {
    computeCamMuxToSvdw();
    computeMipiToIsp();
    computeIspToCamMux();
    computeCamMuxToCied();
    const t1 = setTimeout(computeCamMuxToSvdw, 100);
    const t2 = setTimeout(computeCamMuxToSvdw, 300);
    const t3 = setTimeout(computeCamMuxToSvdw, 600);
    const u1 = setTimeout(computeMipiToIsp, 100);
    const u2 = setTimeout(computeMipiToIsp, 300);
    const u3 = setTimeout(computeMipiToIsp, 600);
    const v1 = setTimeout(computeIspToCamMux, 100);
    const v2 = setTimeout(computeIspToCamMux, 300);
    const v3 = setTimeout(computeIspToCamMux, 600);
    const w1 = setTimeout(computeCamMuxToCied, 100);
    const w2 = setTimeout(computeCamMuxToCied, 300);
    const w3 = setTimeout(computeCamMuxToCied, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(u1); clearTimeout(u2); clearTimeout(u3); clearTimeout(v1); clearTimeout(v2); clearTimeout(v3); clearTimeout(w1); clearTimeout(w2); clearTimeout(w3); };
  }, []);

  // Channel configurations for each MIPI
  // Defaults: mipi0 -> isp0..isp3, mipi1 -> bypass; pairs still share same ISP index
  const [mipi0Channels, setMipi0Channels] = useState<ChannelMode[]>(['isp0', 'isp1', 'isp2', 'isp3']);
  const [mipi1Channels, setMipi1Channels] = useState<ChannelMode[]>(['bypass', 'bypass', 'bypass', 'bypass']);

  // ISP configurations
  const [ispConfigs, setIspConfigs] = useState<Record<string, ISPConfig>>({
    isp0: { cfa: 0, sharedMemory: false },
    isp1: { cfa: 0, sharedMemory: false },
    isp2: { cfa: 0, sharedMemory: false },
    isp3: { cfa: 0, sharedMemory: false }
  });

  const [showISPConfig, setShowISPConfig] = useState<string | null>(null);
  const [showMIPIConfig, setShowMIPIConfig] = useState<{
    mipi: string;
    channel: number;
  } | null>(null);
  const [mipiChannelConfigs, setMipiChannelConfigs] = useState<Record<string, any>>({});
  const [showCameraMuxConfig, setShowCameraMuxConfig] = useState(false);
  const [cameraMuxConfig, setCameraMuxConfig] = useState<{ mappings: Record<number, number> }>({
    mappings: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
  });
  const [rightColTopOffset, setRightColTopOffset] = useState<number>(0);

  // Channel colors - more vibrant and visible
  const channelColors = CHANNEL_HEX;

  const channelColorClasses = CHANNEL_BG;

  // Handle channel mode change
  const handleChannelChange = (mipi: 'mipi0' | 'mipi1', channelIndex: number, mode: ChannelMode) => {
    // Only isp{index} or bypass are allowed per design
    if (mipi === 'mipi0') {
      const next0 = [...mipi0Channels];
      const next1 = [...mipi1Channels];
      // If selecting isp{index} and the paired mipi1 already has isp{index}, force it to bypass
      if (mode.startsWith('isp') && next1[channelIndex] === mode) {
        next1[channelIndex] = 'bypass';
      }
      next0[channelIndex] = mode;
      setMipi0Channels(next0);
      setMipi1Channels(next1);
    } else {
      const next0 = [...mipi0Channels];
      const next1 = [...mipi1Channels];
      if (mode.startsWith('isp') && next0[channelIndex] === mode) {
        next0[channelIndex] = 'bypass';
      }
      next1[channelIndex] = mode;
      setMipi0Channels(next0);
      setMipi1Channels(next1);
    }
  };

  const handleISPConfigSave = (ispId: string, config: ISPConfig) => {
    setIspConfigs(prev => ({
      ...prev,
      [ispId]: config
    }));
  };

  const handleMIPIChannelConfigSave = (mipi: string, channel: number, config: any) => {
    const key = `${mipi}-ch${channel}`;
    setMipiChannelConfigs(prev => ({
      ...prev,
      [key]: config
    }));
  };

  // Get available options for a channel
  const getAvailableOptions = (_mipi: 'mipi0' | 'mipi1', channelIndex: number): ChannelMode[] => {
    // Each index shares the same ISP across mipi0/mipi1
    return [`isp${channelIndex}` as ChannelMode, 'bypass'];
  };

  const shouldShowMipi0 = viewMode === 'unified' || viewMode === 'main';
  const shouldShowMipi1 = viewMode === 'unified' || viewMode === 'sub';

  // Calculate which channels to show based on view mode
  const getActiveChannels = () => {
    const channels: Array<{ mipi: 'mipi0' | 'mipi1'; index: number; mode: ChannelMode; globalIndex: number }> = [];
    if (shouldShowMipi0) {
      mipi0Channels.forEach((mode, idx) => {
        channels.push({ mipi: 'mipi0', index: idx, mode, globalIndex: idx });
      });
    }
    if (shouldShowMipi1) {
      mipi1Channels.forEach((mode, idx) => {
        const globalIdx = shouldShowMipi0 ? idx + 4 : idx;
        channels.push({ mipi: 'mipi1', index: idx, mode, globalIndex: globalIdx });
      });
    }
    return channels;
  };

  const activeChannels = getActiveChannels();

  return (
    <div className={`w-full h-full bg-gray-800 rounded-lg p-6 overflow-auto relative ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug' : '')}`}>
      {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
        <span className="absolute top-1 left-1 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0</span>
      )}
      <div className={`min-w-[1600px] relative h-full ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug' : '')}`}>
        {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
          <span className="absolute -top-3 -left-3 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0-1</span>
        )}
        {/* Main Horizontal Layout */}
        <div
          ref={mainRef}
          className={`relative bg-gray-900 rounded-lg px-8 pt-0 flex flex-col h-full ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug' : '')}`}
          style={{ paddingBottom: `${(() => {
            const topGapPx = 100; // pt-6 top padding in px (reduced to 75% of 32px)
            const bottomOffsetPx = 30; // legend bottom offset
            const h = legendRef.current ? legendRef.current.getBoundingClientRect().height : 0;
            return topGapPx + bottomOffsetPx + h;
          })()}px` }}
        >
          {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
            <span className="absolute -top-3 -left-3 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0-2</span>
          )}
          <div ref={group1Ref} className={`flex items-stretch gap-12 relative h-full ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-purple' : '')}`}>
            {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
              <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded">1</span>
            )}

            {/* Column 1: External Devices */}
            <div ref={extColRef} className={`flex flex-col relative ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-green' : '')}`} style={{ height: `${selectorsHeight}px` }} data-connection-point="ext-col">
              {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">2</span>
              )}
              <div style={{ height: '20%' }} />
              <div className="flex flex-col justify-between flex-1">
              {shouldShowMipi0 && (
                <div
                    className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-[140px]"
                  onClick={() => onDeviceClick('mipi0')}
                  data-connection-point="ext-device-top"
                >
                    <div className="text-center font-semibold text-sm mb-4 text-purple-400">External Devices</div>
                  <div className="flex gap-1 justify-center">
                    {externalDevices?.mipi0 &&
                       ((((externalDevices.mipi0 as any)?.devices && (externalDevices.mipi0 as any).devices.length > 0) ||
                        (Array.isArray(externalDevices.mipi0) && externalDevices.mipi0.length > 0))) ? (
                        (((externalDevices.mipi0 as any)?.devices || externalDevices.mipi0) as any[]).slice(0, 4).map((device: any, index: number) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      [0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded bg-gray-500"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {shouldShowMipi1 && (
                <div
                    className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-[140px]"
                  onClick={() => onDeviceClick('mipi1')}
                  data-connection-point="ext-device-bottom"
                >
                    <div className="text-center font-semibold text-sm mb-4 text-purple-400">External Devices</div>
                  <div className="flex gap-1 justify-center">
                    {externalDevices?.mipi1 &&
                       ((((externalDevices.mipi1 as any)?.devices && (externalDevices.mipi1 as any).devices.length > 0) ||
                        (Array.isArray(externalDevices.mipi1) && externalDevices.mipi1.length > 0))) ? (
                        (((externalDevices.mipi1 as any)?.devices || externalDevices.mipi1) as any[]).slice(0, 4).map((device: any, index: number) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded ${deviceTypeColors[device.type] || 'bg-gray-500'}`}
                          title={`${device.name} - ${device.model}`}
                        />
                      ))
                    ) : (
                      [4, 5, 6, 7].map(i => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded bg-gray-500"
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
              </div>
              <div style={{ height: '20%' }} />
            </div>

            {/* Column 2: MIPI Blocks */}
            <div className={`flex flex-col relative self-stretch ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-green' : '')}`} id="mipi-column" style={{ height: `${selectorsHeight}px` }}>
              {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">3</span>
              )}
              <div style={{ height: '20%' }} />
              <div className="flex flex-col justify-start flex-1">
              {shouldShowMipi0 && (
                  <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-[140px] relative mb-4" id="mipi0-block" style={{ minHeight: '280px' }}>
                    <div className="flex items-center justify-center mb-4">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                      <div className="text-center font-semibold text-sm text-purple-400">MIPI0</div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mb-4">MAIN</div>
                    <select
                      className="w-full text-xs bg-gray-600 text-gray-200 border border-gray-500 rounded px-1 py-0.5 mb-8 font-bold"
                      value={i2cMain}
                      onChange={(e) => setI2cMain(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 16 }).map((_, n) => (
                        <option key={n} value={n} disabled={n === i2cSub} className="bg-gray-700 text-gray-200">
                          {`I2C${n}`}
                        </option>
                      ))}
                    </select>
                    <div className="space-y-4">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between" data-channel={`mipi0-${i}`}>
                          <span className="text-xs font-bold text-gray-200">CH{i}</span>
                        <div
                          className={`w-4 h-4 rounded ${channelColorClasses[i]} cursor-pointer hover:ring-2 hover:ring-white transition-all`}
                          onClick={() => setShowMIPIConfig({ mipi: 'mipi0', channel: i })}
                          title={`Configure MIPI0 CH${i}`}
                          data-anchor={`mipi0-ch${i}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowMipi1 && (
                  <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-[140px] relative mt-auto" id="mipi1-block" style={{ minHeight: '280px' }}>
                    <div className="flex items-center justify-center mb-4">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                      <div className="text-center font-semibold text-sm text-purple-400">MIPI1</div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mb-4">SUB</div>
                    <select
                      className="w-full text-xs bg-gray-600 text-gray-200 border border-gray-500 rounded px-1 py-0.5 mb-8 font-bold"
                      value={i2cSub}
                      onChange={(e) => setI2cSub(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 16 }).map((_, n) => (
                        <option key={n} value={n} disabled={n === i2cMain} className="bg-gray-700 text-gray-200">
                          {`I2C${n}`}
                        </option>
                      ))}
                    </select>
                    <div className="space-y-4">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between" data-channel={`mipi1-${i}`}>
                          <span className="text-xs font-bold text-gray-200">CH{i}</span>
                        <div
                          className={`w-4 h-4 rounded ${channelColorClasses[i + 4]} cursor-pointer hover:ring-2 hover:ring-white transition-all`}
                          onClick={() => setShowMIPIConfig({ mipi: 'mipi1', channel: i })}
                          title={`Configure MIPI1 CH${i}`}
                          data-anchor={`mipi1-ch${i}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
              <div style={{ height: '20%' }} />
            </div>

            {/* Column 3: ISP/Bypass Selectors (positioned on lines) */}
            <div ref={selectorsRef} className={`relative w-[300px] ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-yellow' : '')}`} style={{ height: `${selectorsHeight}px` }}>
              {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                <span className="absolute -top-3 -left-3 bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded">4</span>
              )}
              {/* Connection lines will be drawn here */}
              <svg className="absolute inset-0" style={{ width: '100%', height: '100%', overflow: 'visible' }}></svg>

              {/* ISP Selectors */}
              {activeChannels.map((ch, idx) => {
                // Place ISP0..ISP3 in segment 2, ISP4..ISP7 in segment 4 (5 equal vertical segments)
                const segmentHeight = selectorsHeight / 5;
                const approxHalfSelector = 12; // approximate half of selector height
                let baseTop: number;
                if (ch.globalIndex < 4) {
                  // Segment index 1 (second segment). Distribute 4 items evenly within the segment
                  baseTop = (segmentHeight * 1) + (((ch.index + 0.5) * (segmentHeight / 4)) - approxHalfSelector);
                } else {
                  // Segment index 3 (fourth segment)
                  const localIdx = ch.globalIndex - 4;
                  baseTop = (segmentHeight * 3) + (((localIdx + 0.5) * (segmentHeight / 4)) - approxHalfSelector);
                }
                const topPx = `${baseTop}px`;
                return (
                  <div
                    key={`selector-${idx}`}
                    className="absolute"
                    style={{ left: '120px', top: topPx, zIndex: 10 }}
                    data-connection-point={`isp-left-${ch.globalIndex}-box`}
                  >
                    {/* Right-edge anchor for ISP box to attach lines from ISP to CAM Mux */}
                    <div
                      data-anchor-point={`isp-right-${ch.globalIndex}-box`}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
                    />
                    <ISPSelector
                      value={ch.mode as unknown as SelectorChannelMode}
                      onChange={(next) => handleChannelChange(ch.mipi as 'mipi0' | 'mipi1', ch.index, next as unknown as ChannelMode)}
                      color={channelColors[ch.globalIndex]}
                      options={getAvailableOptions(ch.mipi as 'mipi0' | 'mipi1', ch.index) as unknown as SelectorChannelMode[]}
                      showConfigButton={String(ch.mode).startsWith('isp')}
                      onOpenConfig={() => setShowISPConfig(String(ch.mode))}
                      // Add hover scale via wrapper to avoid select width jitter
                    />
                  </div>
                );
              })}
            </div>

            {/* Column 4: Camera Mux */}
            <div ref={camMuxRef} className={`relative h-full flex flex-col justify-center ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-red' : '')}`}>
              {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                <span className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">5</span>
              )}
            <CameraMuxBlock
              activeChannels={activeChannels}
              cameraMuxConfig={cameraMuxConfig}
              channelColorClasses={channelColorClasses}
              onOpen={() => setShowCameraMuxConfig(true)}
              heightPx={Math.max(0, Math.round((selectorsHeight * 3) / 5))}
            />
            </div>
          
          {/* Overlay lines: Camera Mux R0..R3 -> SVDW 1-1..4-1 */}
          {camToSvdwLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-small" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {camToSvdwLines.map((l, i) => (
                <g key={i}>
                  <line
                    x1={l.x1}
                    y1={l.y1}
                    x2={l.x2}
                    y2={l.y2}
                    stroke={l.color}
                    strokeWidth={3}
                    strokeOpacity="0.9"
                    markerEnd={l.arrow ? 'url(#arrowhead-small)' : undefined}
                  />
                  {!l.arrow && <circle cx={l.x2} cy={l.y2} r="4" fill={l.color} />}
                  <circle cx={l.x1} cy={l.y1} r="4" fill={l.color} />
                </g>
              ))}
            </svg>
          )}

          {/* Overlay lines: Camera Mux R0..R7 -> CIED slots 0..7 */}
          {camToCiedLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-cied" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {camToCiedLines.map((l, i) => (
                <g key={i}>
                  <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" markerEnd="url(#arrowhead-cied)" />
                  {l.hasStartDot && (
                    <circle cx={l.x1} cy={l.y1} r="4" fill={l.color} stroke="white" strokeWidth="1" />
                  )}
                </g>
              ))}
            </svg>
          )}

          {/* Overlay lines: Camera Mux right markers -> MIPI channel squares */}
          {muxToMipi.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-l" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {muxToMipi.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" markerEnd="url(#arrowhead-l)" />
              ))}
            </svg>
          )}

          {/* Overlay lines: CHi -> ISPi */}
          {chToIspLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              {chToIspLines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" />
              ))}
            </svg>
          )}

          {/* Overlay lines: ISPi -> Li */}
          {ispToLLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-l-isp" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {ispToLLines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" markerEnd="url(#arrowhead-l-isp)" />
              ))}
            </svg>
          )}

          {/* Overlay lines: External Devices -> MIPI0, MIPI1 */}
          {externalToMipiLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-ext-mipi" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {externalToMipiLines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" markerEnd="url(#arrowhead-ext-mipi)" />
              ))}
            </svg>
          )}


            {/* Right group: CIED (left) — 20px spacer — SVDW/VideoPipeline (right) */}
            <div ref={rightGroupRef} className={`ml-auto flex items-start relative ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-blue' : '')}`}>
              {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                <span className="absolute -top-3 -left-3 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">6</span>
              )}
              <div ref={ciedRef} className="absolute" style={{ left: '-600px' }}>
                <CIEDBar />
              </div>
              <div style={{ width: '20px' }} />
              <div ref={rightColRef} className={`flex flex-col ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? '' : '')}`} style={{ marginTop: `${rightColTopOffset}px`, height: `${selectorsHeight}px` }}>
                {/* Top half: SVDW bottom-aligned */}
                <div className={`relative w-full ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-orange' : '')}`} style={{ height: `${Math.max(0, Math.round(selectorsHeight/2) - 10)}px`, display: 'flex', alignItems: 'flex-end' }}>
                  {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                    <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">6-1</span>
                  )}
                  <div ref={svdwRef} className="w-full">
                    <div className="w-full">
                <SVDWBlock />
                    </div>
                  </div>
                </div>
                {/* Gap 20px */}
                <div style={{ height: '20px' }} />
                {/* Bottom half: Video group top-aligned */}
                <div ref={videoGroupRef} className={`relative ${useCameraStore(s => s.debugMainCoreViewHorizontalLayout ? 'debug-orange' : '')}`} style={{ height: `${Math.max(0, Math.round(selectorsHeight/2) - 10)}px`, display: 'flex', alignItems: 'flex-start' }}>
                  {useCameraStore(s => s.debugMainCoreViewHorizontalLayout) && (
                    <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">6-3</span>
                  )}
                  <VideoOutputsSection />
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Legend - stick to the bottom of dark background */}
        <div ref={legendRef} className="absolute left-8 right-8 bg-gray-700 p-3 rounded-lg" style={{ bottom: '30px' }}>
          <h3 className="text-white text-sm font-semibold mb-2">Channel Mapping</h3>
          <div className="grid grid-cols-8 gap-3">
            {activeChannels.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${channelColorClasses[ch.globalIndex]}`}></div>
                <span className="text-xs text-gray-300">{ch.mipi.toUpperCase()}-VC{ch.index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISP Configuration Modal */}
      {showISPConfig && (
        <ISPConfigModal
          ispId={showISPConfig}
          currentConfig={ispConfigs[showISPConfig]}
          onSave={(config) => handleISPConfigSave(showISPConfig, config)}
          onClose={() => setShowISPConfig(null)}
        />
      )}

      {/* MIPI Channel Configuration Modal */}
      {showMIPIConfig && (
        <MIPIChannelConfigModal
          mipiId={showMIPIConfig.mipi}
          channelId={showMIPIConfig.channel}
          currentConfig={mipiChannelConfigs[`${showMIPIConfig.mipi}-ch${showMIPIConfig.channel}`]}
          onSave={(config) => {
            handleMIPIChannelConfigSave(showMIPIConfig.mipi, showMIPIConfig.channel, config);
            setShowMIPIConfig(null);
          }}
          onClose={() => setShowMIPIConfig(null)}
        />
      )}

      {/* Camera Mux Configuration Modal */}
      {showCameraMuxConfig && (
        <CameraMuxConfigModal
          currentConfig={cameraMuxConfig}
          onSave={(config) => {
            setCameraMuxConfig(config);
            setShowCameraMuxConfig(false);
          }}
          onClose={() => setShowCameraMuxConfig(false)}
        />
      )}
    </div>
  );
};