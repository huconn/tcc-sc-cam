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
import { ISPBlock } from '@/components/ISP/ISPBlock';
import { channelHex as CHANNEL_HEX, channelBgClass as CHANNEL_BG, getChannelHex, getChannelBgClass } from '@/utils/channelPalette';
import { MIPIChannelConfigModal } from './MIPIChannelConfigModal';
import { CameraMuxConfigModal } from '../CameraMux/CameraMuxConfigModal';
import { CameraMuxBlock } from '@/components/CameraMux/CameraMuxBlock';
import { SVDWBlock } from '@/components/SVDW/SVDWBlock';
import { VideoOutputsSection } from '@/components/VideoPipeline/VideoOutputsSection';
import { CIEDBar } from '@/components/CIED/CIEDBar';
import { I2CPanel } from '@/components/I2CConfiguration';

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
  const [ispToCiedLines, setIspToCiedLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string;hasArrow?:boolean}>>([]);
  const [i2cToExternalLines, setI2cToExternalLines] = useState<Array<{x1:number;y1:number;x2:number;y2:number;color:string}>>([]);
  const [selectorTopOverrides, setSelectorTopOverrides] = useState<Record<number, number>>({});
  const forceHorizontalOutputs = useCameraStore(s => s.debugMainCoreViewHorizontalForceOutputs ?? false);
  
  // Debug flags
  const debugSelectMainCoreOperations = useCameraStore((s: any) => s.debugSelectMainCoreOperations ?? 1);
  const debugSelectSubCoreOperations = useCameraStore((s: any) => s.debugSelectSubCoreOperations ?? 1);
  
  // MIPI type states
  const [mipi0Type, setMipi0Type] = useState<'MAIN' | 'SUB'>('MAIN');
  const [mipi1Type, setMipi1Type] = useState<'MAIN' | 'SUB'>('SUB');
  
  // Determine behavior based on viewMode and debug flags
  const getMipiBehavior = () => {
    if (viewMode === 'main') {
      if (debugSelectMainCoreOperations === 1) {
        // Current main core behavior
        return { showMipi0: true, showMipi1: false, mipi0Fixed: false, mipi1Fixed: false };
      } else if (debugSelectMainCoreOperations === 2) {
        // Unified view with MAIN fixed for both MIPI0 and MIPI1
        return { showMipi0: true, showMipi1: true, mipi0Fixed: true, mipi1Fixed: true };
      } else if (debugSelectMainCoreOperations === 3) {
        // Main view with SUB core selected - both MIPI0 and MIPI1 show SUB
        return { showMipi0: true, showMipi1: true, mipi0Fixed: true, mipi1Fixed: true };
      }
    } else if (viewMode === 'sub') {
      if (debugSelectSubCoreOperations === 1) {
        // Current sub core behavior
        return { showMipi0: false, showMipi1: true, mipi0Fixed: false, mipi1Fixed: false };
      } else if (debugSelectSubCoreOperations === 2) {
        // Sub view with SUB core selected - both MIPI0 and MIPI1 show SUB
        return { showMipi0: true, showMipi1: true, mipi0Fixed: true, mipi1Fixed: true };
      }
    } else if (viewMode === 'unified') {
      // Unified view: both MIPI0 and MIPI1 selectable, default MIPI0=MAIN, MIPI1=SUB
      return { showMipi0: true, showMipi1: true, mipi0Fixed: false, mipi1Fixed: false };
    }
    // Default behavior
    return { showMipi0: true, showMipi1: true, mipi0Fixed: false, mipi1Fixed: false };
  };
  
  const mipiBehavior = getMipiBehavior();
  
  // Force values when fixed
  useEffect(() => {
    if (mipiBehavior.mipi0Fixed) {
      // For main core with SUB selected, MIPI0 should be SUB
      if (viewMode === 'main' && debugSelectMainCoreOperations === 3) {
        setMipi0Type('SUB');
      } else if (viewMode === 'sub' && debugSelectSubCoreOperations === 2) {
        // Sub core with SUB selected
        setMipi0Type('SUB');
    } else {
        setMipi0Type('MAIN');
      }
    }
    if (mipiBehavior.mipi1Fixed) {
      // For main core with SUB selected, MIPI1 should be SUB
      if (viewMode === 'main' && debugSelectMainCoreOperations === 3) {
        setMipi1Type('SUB');
      } else if (viewMode === 'main' && debugSelectMainCoreOperations === 2) {
        // Main core with MAIN selected
        setMipi1Type('MAIN');
      } else if (viewMode === 'sub' && debugSelectSubCoreOperations === 2) {
        // Sub core with SUB selected
        setMipi1Type('SUB');
      } else {
        setMipi1Type('SUB');
      }
    }
  }, [mipiBehavior.mipi0Fixed, mipiBehavior.mipi1Fixed, viewMode, debugSelectMainCoreOperations, debugSelectSubCoreOperations]);


  // Set default values for unified view
  useEffect(() => {
    if (viewMode === 'unified') {
      setMipi0Type('MAIN');
      setMipi1Type('SUB');
    }
  }, [viewMode]);

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
        const outputIdx = match ? parseInt(match[1], 10) : 0;
        // 매핑된 Input 채널의 색상 사용 (ref를 통해 최신 값 참조)
        const inputIdx = cameraMuxConfigRef.current.mappings[outputIdx] ?? outputIdx;
        const color = channelColors[inputIdx] || '#93c5fd';
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

      // 매핑된 Input 채널의 색상 사용 (ref를 통해 최신 값 참조)
      const inputIdx = cameraMuxConfigRef.current.mappings[i] ?? i;
      lines.push({ x1, y1, x2, y2, color: channelColors[inputIdx], hasStartDot: true });
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
    
    // MIPI1 line: from bottom External Devices block to MIPI1 block left center
    if (mipi1Box) {
      const bottomExtDevice = document.querySelector('[data-connection-point="ext-device-bottom"]') as HTMLElement | null;
      if (bottomExtDevice) {
        const extRect = bottomExtDevice.getBoundingClientRect();
        const extRightEdge = extRect.left + extRect.width;
        const extCenterY = extRect.top + extRect.height / 2;
        
        const mipi1Rect = mipi1Box.getBoundingClientRect();
        const mipi1CenterY = mipi1Rect.top + mipi1Rect.height / 2;
        
        // Line from External Device to MIPI1 block left center
        lines.push({
          x1: extRightEdge,
          y1: extCenterY,
          x2: mipi1Rect.left,
          y2: mipi1CenterY, // Connect to MIPI1 left center
          color: '#86efac' // light green
        });
      }
    }
    
    setExternalToMipiLines(lines);
  };

  // I2C to External Device connection lines
  const computeI2cToExternal = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string}> = [];
    
    // Find I2C blocks
    const i2cMipi0Block = document.querySelector('#i2c-mipi0-block') as HTMLElement | null;
    const i2cMipi1Block = document.querySelector('#i2c-mipi1-block') as HTMLElement | null;
    
    // I2C MIPI0 to External Device MIPI0
    if (i2cMipi0Block) {
      const topExtDevice = document.querySelector('[data-connection-point="ext-device-top"]') as HTMLElement | null;
      if (topExtDevice) {
        const i2cRect = i2cMipi0Block.getBoundingClientRect();
        const extRect = topExtDevice.getBoundingClientRect();
        
        // Line from I2C left edge to External Device right edge
        lines.push({
          x1: i2cRect.left,
          y1: i2cRect.top + i2cRect.height / 2,
          x2: extRect.left + extRect.width,
          y2: extRect.top + extRect.height / 2,
          color: '#3b82f6' // blue
        });
      }
    }
    
    // I2C MIPI1 to External Device MIPI1
    if (i2cMipi1Block) {
      const bottomExtDevice = document.querySelector('[data-connection-point="ext-device-bottom"]') as HTMLElement | null;
      if (bottomExtDevice) {
        const i2cRect = i2cMipi1Block.getBoundingClientRect();
        const i2cCenterY = i2cRect.top + i2cRect.height / 2;
        const extRect = bottomExtDevice.getBoundingClientRect();
        const extCenterY = extRect.top + extRect.height / 2;
        
        // Line from I2C left center to External Device right edge
        lines.push({
          x1: i2cRect.left,
          y1: i2cCenterY, // I2C left center Y
          x2: extRect.left + extRect.width,
          y2: extCenterY, // External Device right center Y
          color: '#10b981' // green
        });
      }
    }
    
    setI2cToExternalLines(lines);
  };

  // ISP to CIED connection lines
  const computeIspToCied = () => {
    const lines: Array<{x1:number;y1:number;x2:number;y2:number;color:string}> = [];
    
    // mipi0 ISP1 -> IR0 connection (row 3)
    if (mipi0Channels[1] === 'isp1') {
      const isp1 = document.querySelector('[data-anchor-point="isp-right-1-box"]') as HTMLElement | null;
      const ir0 = document.querySelector('[data-connection-point="ir0-box"]') as HTMLElement | null;
      
      if (isp1 && ir0) {
        const isp1Rect = isp1.getBoundingClientRect();
        const ir0Rect = ir0.getBoundingClientRect();
        
        const ir0LeftCenterX = ir0Rect.left;
        const ir0LeftCenterY = ir0Rect.top + ir0Rect.height / 2;
        
        const startX = isp1Rect.left + isp1Rect.width;
        const startY = isp1Rect.top + isp1Rect.height / 2;
        
        lines.push({
          x1: startX,
          y1: startY,
          x2: startX,
          y2: ir0LeftCenterY,
          color: channelColors[1]
        });
        
        lines.push({
          x1: startX,
          y1: ir0LeftCenterY,
          x2: ir0LeftCenterX,
          y2: ir0LeftCenterY,
          color: channelColors[1]
        });
      }
    }
    
    // mipi1 ISP1 (ISP5) -> IR0 connection (row 11)
    if (mipi1Channels[1] === 'isp1') {
      const isp5 = document.querySelector('[data-anchor-point="isp-right-5-box"]') as HTMLElement | null;
      const ir0Mipi1 = document.querySelector('[data-connection-point="ir0-box-mipi1"]') as HTMLElement | null;
      
      if (isp5 && ir0Mipi1) {
        const isp5Rect = isp5.getBoundingClientRect();
        const ir0Rect = ir0Mipi1.getBoundingClientRect();
        
        const ir0LeftCenterX = ir0Rect.left;
        const ir0LeftCenterY = ir0Rect.top + ir0Rect.height / 2;
        
        const startX = isp5Rect.left + isp5Rect.width;
        const startY = isp5Rect.top + isp5Rect.height / 2;
        
        lines.push({
          x1: startX,
          y1: startY,
          x2: startX,
          y2: ir0LeftCenterY,
          color: channelColors[5]
        });
        
        lines.push({
          x1: startX,
          y1: ir0LeftCenterY,
          x2: ir0LeftCenterX,
          y2: ir0LeftCenterY,
          color: channelColors[5]
        });
      }
    }
    
    // mipi0 ISP3 -> IR1 connection (row 7)
    if (mipi0Channels[3] === 'isp3') {
      const isp3 = document.querySelector('[data-anchor-point="isp-right-3-box"]') as HTMLElement | null;
      const ir1 = document.querySelector('[data-connection-point="ir1-box"]') as HTMLElement | null;
      
      if (isp3 && ir1) {
        const isp3Rect = isp3.getBoundingClientRect();
        const ir1Rect = ir1.getBoundingClientRect();
        
        const ir1LeftCenterX = ir1Rect.left;
        const ir1LeftCenterY = ir1Rect.top + ir1Rect.height / 2;
        
        const startX3 = isp3Rect.left + isp3Rect.width;
        const startY3 = isp3Rect.top + isp3Rect.height / 2;
        
        lines.push({
          x1: startX3,
          y1: startY3,
          x2: startX3,
          y2: ir1LeftCenterY,
          color: channelColors[3]
        });
        
        lines.push({
          x1: startX3,
          y1: ir1LeftCenterY,
          x2: ir1LeftCenterX,
          y2: ir1LeftCenterY,
          color: channelColors[3]
        });
      }
    }
    
    // mipi1 ISP3 (ISP7) -> IR1 connection (row 15)
    if (mipi1Channels[3] === 'isp3') {
      const isp7 = document.querySelector('[data-anchor-point="isp-right-7-box"]') as HTMLElement | null;
      const ir1Mipi1 = document.querySelector('[data-connection-point="ir1-box-mipi1"]') as HTMLElement | null;
      
      if (isp7 && ir1Mipi1) {
        const isp7Rect = isp7.getBoundingClientRect();
        const ir1Rect = ir1Mipi1.getBoundingClientRect();
        
        const ir1LeftCenterX = ir1Rect.left;
        const ir1LeftCenterY = ir1Rect.top + ir1Rect.height / 2;
        
        const startX7 = isp7Rect.left + isp7Rect.width;
        const startY7 = isp7Rect.top + isp7Rect.height / 2;
        
        lines.push({
          x1: startX7,
          y1: startY7,
          x2: startX7,
          y2: ir1LeftCenterY,
          color: channelColors[7]
        });
        
        lines.push({
          x1: startX7,
          y1: ir1LeftCenterY,
          x2: ir1LeftCenterX,
          y2: ir1LeftCenterY,
          color: channelColors[7]
        });
      }
    }
    
    
    setIspToCiedLines(lines);
  };

  // Open CIED modal for a given slot by delegating to CIEDBar's button
  const openCiedSlot = (slot: number) => {
    try {
      const btn = document.querySelector(`[data-connection-point="cied-slot-${slot}"]`) as HTMLButtonElement | null;
      btn?.click();
    } catch {}
  };

  useEffect(() => {
    const updateOnce = () => {
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

      //i2c to external devices
      computeI2cToExternal();

      // Note: computeIspToCied() is called separately when ISP modes change
      // to avoid flickering when IR boxes are conditionally rendered

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

      // Ensure Right Group height matches container 1
      try {
        if (group1Ref.current && rightGroupRef.current) {
          const group1Rect = group1Ref.current.getBoundingClientRect();
          (rightGroupRef.current as HTMLDivElement).style.height = `${Math.round(group1Rect.height)}px`;
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
    computeExternalToMipi();
    computeI2cToExternal();
    computeIspToCied();
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
    const x1 = setTimeout(computeExternalToMipi, 100);
    const x2 = setTimeout(computeExternalToMipi, 300);
    const x3 = setTimeout(computeExternalToMipi, 600);
    const y1 = setTimeout(computeI2cToExternal, 100);
    const y2 = setTimeout(computeI2cToExternal, 300);
    const y3 = setTimeout(computeI2cToExternal, 600);
    const z1 = setTimeout(computeIspToCied, 100);
    const z2 = setTimeout(computeIspToCied, 300);
    const z3 = setTimeout(computeIspToCied, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(u1); clearTimeout(u2); clearTimeout(u3); clearTimeout(v1); clearTimeout(v2); clearTimeout(v3); clearTimeout(w1); clearTimeout(w2); clearTimeout(w3); clearTimeout(x1); clearTimeout(x2); clearTimeout(x3); clearTimeout(y1); clearTimeout(y2); clearTimeout(y3); clearTimeout(z1); clearTimeout(z2); clearTimeout(z3); };
  }, []);

  // Channel configurations for each MIPI
  // Defaults: mipi0 -> isp0..isp3, mipi1 -> bypass; pairs still share same ISP index
  const [mipi0Channels, setMipi0Channels] = useState<ChannelMode[]>(['isp0', 'isp1', 'isp2', 'isp3']);
  const [mipi1Channels, setMipi1Channels] = useState<ChannelMode[]>(['bypass', 'bypass', 'bypass', 'bypass']);

  // Update ISP to IR connections when ISP modes change
  useEffect(() => {
    // Wait for DOM to settle, then redraw lines
    let rafId: number;
    const redrawLines = () => {
      rafId = requestAnimationFrame(() => {
        computeIspToCied();
      });
    };
    
    const timer = setTimeout(redrawLines, 100);
    
    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mipi0Channels, mipi1Channels]);

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
  // cameraMuxConfig의 최신 값을 항상 참조하기 위한 ref
  const cameraMuxConfigRef = useRef(cameraMuxConfig);
  useEffect(() => {
    cameraMuxConfigRef.current = cameraMuxConfig;
  }, [cameraMuxConfig]);
  
  const [rightColTopOffset, setRightColTopOffset] = useState<number>(0);

  // Camera Mux 설정 변경 시 연결선 색상 자동 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      computeCamMuxToSvdw();
      computeCamMuxToCied();
    }, 50);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMuxConfig]);

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

  // Use new behavior logic instead of old shouldShowMipi0/1
  const shouldShowMipi0 = mipiBehavior.showMipi0;
  const shouldShowMipi1 = mipiBehavior.showMipi1;

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
    <div className={`w-full h-full bg-gray-800 rounded-lg p-6 overflow-auto relative ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug' : '')}`}>
      {useCameraStore(s => s.debugShowLayoutBorders) && (
        <span className="absolute top-1 left-1 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0</span>
      )}
      <div className={`min-w-[1400px] relative h-full ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug' : '')}`}>
        {useCameraStore(s => s.debugShowLayoutBorders) && (
          <span className="absolute -top-3 -left-3 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0-1</span>
        )}
        {/* Main Horizontal Layout */}
        <div
          ref={mainRef}
          className={`relative bg-gray-900 rounded-lg px-8 pt-0 flex flex-col h-full ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug' : '')}`}
          style={{ paddingBottom: `${(() => {
            const topGapPx = 100; // pt-6 top padding in px (reduced to 75% of 32px)
            const bottomOffsetPx = 30; // legend bottom offset
            const h = legendRef.current ? legendRef.current.getBoundingClientRect().height : 0;
            return topGapPx + bottomOffsetPx + h;
          })()}px` }}
        >
          {useCameraStore(s => s.debugShowLayoutBorders) && (
            <span className="absolute -top-3 -left-3 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded">0-2</span>
          )}
          <div ref={group1Ref} className={`flex items-stretch relative h-full ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-purple' : '')}`} style={{ marginTop: '30px', gap: '40px' }}>
            {useCameraStore(s => s.debugShowLayoutBorders) && (
              <span className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded">1</span>
            )}

            {/* Container 1-1: External Devices */}
            <div className={`flex flex-col relative rounded-lg w-1/10 flex-shrink-0 ${useCameraStore(s => s.debugShowLayoutBorders ? 'border-2 border-cyan-500 debug-cyan' : '')}`} style={{ padding: '10px', backgroundColor: 'rgba(219, 234, 254, 0.22)' }}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-cyan-600 text-white text-[10px] px-1.5 py-0.5 rounded">1-1</span>
              )}
              
              {/* External Devices - 1-1에 종속 */}
              <div ref={extColRef} className={`flex flex-col relative h-full ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-green' : '')}`} data-connection-point="ext-col">
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">2</span>
              )}
              <div style={{ height: '20%' }} />
              <div className="flex flex-col gap-4 flex-1">
              {shouldShowMipi0 && (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div
                    className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-full"
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
                </div>
              )}

              {shouldShowMipi1 && (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div
                    className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors w-full"
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
                </div>
              )}
              </div>
              <div style={{ height: '20%' }} />
              </div>
            </div>

            {/* Container 1-2: MIPI, ISP, Camera Mux, Right Group */}
            <div className={`flex items-stretch relative h-full rounded-lg flex-1 ${useCameraStore(s => s.debugShowLayoutBorders ? 'border-2 border-pink-500 debug-pink' : '')}`} style={{ padding: '10px', gap: '40px', backgroundColor: 'rgba(209, 213, 219, 0.12)' }}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-pink-600 text-white text-[10px] px-1.5 py-0.5 rounded">1-2</span>
              )}

            {/* Column 2: MIPI Blocks */}
            <div className={`flex flex-col relative self-stretch ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-green' : '')}`} id="mipi-column" style={{ height: `${selectorsHeight}px`, width: '15%' }}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded z-50">3</span>
              )}
              
              {/* Debug Grid Lines for MIPI Column */}
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top 20% section */}
                  <div className="absolute border-2 border-green-400 bg-green-400/10" style={{ top: '0px', left: '0px', width: '100%', height: '20%' }}>
                    <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">3-1</span>
                  </div>
                  {/* Middle section */}
                  <div className="absolute border-2 border-green-400 bg-green-400/10" style={{ top: '20%', left: '0px', width: '100%', height: '60%' }}>
                    <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">3-2</span>
                  </div>
                  {/* Bottom 20% section */}
                  <div className="absolute border-2 border-green-400 bg-green-400/10" style={{ top: '80%', left: '0px', width: '100%', height: '20%' }}>
                    <span className="absolute -top-3 -left-3 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">3-3</span>
                  </div>
                </div>
              )}
              
              <div style={{ height: '20%' }} />
              
              <div className="flex flex-col gap-4 flex-1">
              {shouldShowMipi0 && (
                <div className="flex flex-col flex-1">
                  {/* I2C Block for MIPI0 */}
                  <I2CPanel 
                    shouldShowMipi0={true}
                    shouldShowMipi1={false}
                  />
                  
                  {/* MIPI0 Block - centered in remaining space */}
                  <div className="flex flex-col justify-center flex-1">
                    <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-full relative" id="mipi0-block" style={{ minHeight: '240px' }}>
                    <div className="flex items-center justify-center mb-4">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                  <div className="text-center font-semibold text-sm text-purple-400">MIPI0</div>
                    </div>
                    <select
                      className={`w-full text-xs border border-gray-500 rounded px-1 py-0.5 mb-4 font-bold ${
                        mipiBehavior.mipi0Fixed ? 'bg-sky-200 text-gray-900' : 'bg-gray-600 text-gray-200'
                      }`}
                      value={mipi0Type}
                      onChange={(e) => setMipi0Type(e.target.value as 'MAIN' | 'SUB')}
                      disabled={mipiBehavior.mipi0Fixed}
                    >
                      <option value="MAIN" className="bg-gray-700 text-gray-200">MAIN</option>
                      <option value="SUB" className="bg-gray-700 text-gray-200">SUB</option>
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
                  </div>
                </div>
              )}

              {shouldShowMipi1 && (
                <div className="flex flex-col flex-1">
                  {/* I2C Block for MIPI1 */}
                  <I2CPanel 
                    shouldShowMipi0={false}
                    shouldShowMipi1={true}
                  />
                  
                  {/* MIPI1 Block - centered in remaining space */}
                  <div className="flex flex-col justify-center flex-1">
                    <div className="bg-gray-700 border-2 border-purple-500 rounded-lg p-4 w-full relative" id="mipi1-block" style={{ minHeight: '240px' }}>
                    <div className="flex items-center justify-center mb-4">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                  <div className="text-center font-semibold text-sm text-purple-400">MIPI1</div>
                    </div>
                    <select
                      className={`w-full text-xs border border-gray-500 rounded px-1 py-0.5 mb-4 font-bold ${
                        mipiBehavior.mipi1Fixed ? 'bg-sky-200 text-gray-900' : 'bg-gray-600 text-gray-200'
                      }`}
                      value={mipi1Type}
                      onChange={(e) => setMipi1Type(e.target.value as 'MAIN' | 'SUB')}
                      disabled={mipiBehavior.mipi1Fixed}
                    >
                      <option value="MAIN" className="bg-gray-700 text-gray-200">MAIN</option>
                      <option value="SUB" className="bg-gray-700 text-gray-200">SUB</option>
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
                  </div>
                </div>
              )}
              </div>
              <div style={{ height: '20%' }} />
            </div>

            {/* Column 3: ISP Block */}
            <div ref={selectorsRef} className={`relative flex-shrink-0 flex flex-col justify-center ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-yellow' : '')}`} style={{ height: `${selectorsHeight}px` }}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded z-50">4</span>
              )}
              
              <ISPBlock
                activeChannels={activeChannels}
                channelColors={channelColors}
                onChannelChange={handleChannelChange}
                getAvailableOptions={getAvailableOptions}
                onOpenISPConfig={setShowISPConfig}
                onOpenCiedSlot={openCiedSlot}
                heightPx={Math.max(0, Math.round((selectorsHeight * 4) / 5))}
              />
            </div>

            {/* Column 4: Camera Mux */}
            <div ref={camMuxRef} className={`relative h-full flex flex-col justify-center ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-red' : '')}`} style={{ width: '50%' }}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">5</span>
              )}
            <CameraMuxBlock
              activeChannels={activeChannels}
              cameraMuxConfig={cameraMuxConfig}
              channelColorClasses={channelColorClasses}
              onOpen={() => setShowCameraMuxConfig(true)}
              heightPx={Math.max(0, Math.round((selectorsHeight * 4) / 5))}
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

          {/* Overlay lines: ISP -> CIED */}
          {ispToCiedLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-isp-cied" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {ispToCiedLines.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={l.color}
                  strokeWidth="3"
                  strokeOpacity="0.9"
                  markerEnd={i % 2 === 1 ? 'url(#arrowhead-isp-cied)' : undefined}
                />
              ))}
            </svg>
          )}

          {/* Overlay lines: I2C -> External Devices */}
          {i2cToExternalLines.length > 0 && (
            <svg className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-10" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead-i2c-ext" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                  <polygon points="0 0, 5 1.75, 0 3.5" fill="context-stroke" />
                </marker>
              </defs>
              {i2cToExternalLines.map((l, i) => (
                <line key={`i2c-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="3" strokeOpacity="0.9" markerEnd="url(#arrowhead-i2c-ext)" />
              ))}
            </svg>
          )}

            {/* Right group: CIED + SVDW/VideoPipeline */}
            <div ref={rightGroupRef} className={`flex items-stretch relative gap-2 flex-1 ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-blue' : '')}`}>
              {useCameraStore(s => s.debugShowLayoutBorders) && (
                <span className="absolute -top-3 -left-3 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">6</span>
              )}
              
              {/* CIED - flex item */}
              <div ref={ciedRef} className="flex items-end pb-5" style={{ flexShrink: 0 }}>
                <CIEDBar />
              </div>
              
              {/* SVDW/Video Column */}
              <div ref={rightColRef} className={`flex flex-col flex-1 ${useCameraStore(s => s.debugShowLayoutBorders ? '' : '')}`} style={{ marginTop: `${rightColTopOffset}px`, height: `${selectorsHeight}px` }}>
                {/* Top half: SVDW bottom-aligned */}
                <div className={`relative w-full ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-orange' : '')}`} style={{ height: `${Math.max(0, Math.round(selectorsHeight/2) - 10)}px`, display: 'flex', alignItems: 'flex-end' }}>
                  {useCameraStore(s => s.debugShowLayoutBorders) && (
                    <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">6-1</span>
                  )}
                  <div ref={svdwRef} className="w-full">
                    <div className="w-full">
                <SVDWBlock cameraMuxMappings={cameraMuxConfig.mappings} />
                    </div>
                  </div>
                </div>
                {/* Gap 20px */}
                <div style={{ height: '20px' }} />
                {/* Bottom half: Video group top-aligned */}
                <div ref={videoGroupRef} className={`relative ${useCameraStore(s => s.debugShowLayoutBorders ? 'debug-orange' : '')}`} style={{ height: `${Math.max(0, Math.round(selectorsHeight/2) - 10)}px`, display: 'flex', alignItems: 'flex-start' }}>
                  {useCameraStore(s => s.debugShowLayoutBorders) && (
                    <span className="absolute -top-3 -left-3 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">6-3</span>
                  )}
                  <VideoOutputsSection cameraMuxMappings={cameraMuxConfig.mappings} />
                </div>
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
                <span className="text-xs text-gray-300">{ch.mipi.toUpperCase()}-CH{ch.index}</span>
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
            // Store에도 매핑 정보 저장
            const mappingsArray = Object.entries(config.mappings).map(([output, input]) => ({
              output: `ch${output}`,
              input: `ch${input}`
            }));
            useCameraStore.getState().updateCameraMux({ mappings: mappingsArray });
            
            // 먼저 config를 업데이트하고 모달을 닫음
            setCameraMuxConfig(config);
            setShowCameraMuxConfig(false);
            
            // 연결선 색상 업데이트를 위해 여러 번 재계산 (DOM 업데이트 대기)
            setTimeout(() => {
              computeCamMuxToSvdw();
              computeCamMuxToCied();
            }, 50);
            setTimeout(() => {
              computeCamMuxToSvdw();
              computeCamMuxToCied();
            }, 150);
            setTimeout(() => {
              computeCamMuxToSvdw();
              computeCamMuxToCied();
            }, 300);
          }}
          onClose={() => setShowCameraMuxConfig(false)}
        />
      )}
    </div>
  );
};