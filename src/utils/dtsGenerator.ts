import { CameraConfiguration, Device, MIPIChannel, ISPConfig } from '@/types/camera';

export class DTSGenerator {
  private config: CameraConfiguration;
  private indent = '\t';

  constructor(config: CameraConfiguration) {
    this.config = config;
  }

  generateMainCoreDTS(): string {
    return this.generateDTS('main');
  }

  generateSubCoreDTS(): string {
    return this.generateDTS('sub');
  }

  private generateDTS(core: 'main' | 'sub'): string {
    const lines: string[] = [];

    lines.push('/dts-v1/;');
    lines.push('');
    lines.push('/ {');

    // Generate camera sensors
    this.generateSensors(lines, core);

    // Generate MIPI CSI nodes
    this.generateMIPI(lines, core);

    // Generate ISP nodes
    this.generateISP(lines, core);

    // Generate SVDW nodes
    this.generateSVDW(lines, core);

    // Generate Video Input nodes
    this.generateVideoInput(lines, core);

    // Generate CIED nodes
    this.generateCIED(lines, core);

    // Generate MDW node if enabled
    if (this.config.mdwConfig.enabled) {
      this.generateMDW(lines, core);
    }

    lines.push('};');

    return lines.join('\n');
  }

  private generateSensors(lines: string[], core: 'main' | 'sub'): void {
    const sensors = this.config.devices.filter(d => d.type === 'sensor');

    sensors.forEach(sensor => {
      lines.push(`${this.indent}${sensor.name.toLowerCase().replace(' ', '_')}: camera-sensor@${sensor.i2cAddress || '0'} {`);
      lines.push(`${this.indent}${this.indent}compatible = "camera,sensor";`);
      lines.push(`${this.indent}${this.indent}status = "okay";`);

      if (sensor.i2cAddress) {
        lines.push(`${this.indent}${this.indent}reg = <0x${sensor.i2cAddress}>;`);
      }

      if (sensor.gpioReset) {
        lines.push(`${this.indent}${this.indent}reset-gpios = <&gpio ${sensor.gpioReset} GPIO_ACTIVE_LOW>;`);
      }

      if (sensor.gpioPower) {
        lines.push(`${this.indent}${this.indent}power-gpios = <&gpio ${sensor.gpioPower} GPIO_ACTIVE_HIGH>;`);
      }

      lines.push(`${this.indent}${this.indent}port {`);
      lines.push(`${this.indent}${this.indent}${this.indent}sensor_out: endpoint {`);
      lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}remote-endpoint = <&mipi_in>;`);
      lines.push(`${this.indent}${this.indent}${this.indent}};`);
      lines.push(`${this.indent}${this.indent}};`);
      lines.push(`${this.indent}};`);
      lines.push('');
    });
  }

  private generateMIPI(lines: string[], core: 'main' | 'sub'): void {
    const mipiChannels = this.config.mipiChannels.filter(m => m.core === core);

    mipiChannels.forEach(mipi => {
      lines.push(`${this.indent}${mipi.name.toLowerCase()}: mipi-csi@0 {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,mipi-csi";`);
      lines.push(`${this.indent}${this.indent}status = "okay";`);
      lines.push(`${this.indent}${this.indent}num-channel = <${mipi.virtualChannels}>;`);
      lines.push(`${this.indent}${this.indent}data-lanes = <${mipi.dataLanes}>;`);
      lines.push(`${this.indent}${this.indent}hs-settle = <${mipi.hsSettle}>;`);
      lines.push(`${this.indent}${this.indent}interleave-mode = <${mipi.interleaveMode ? 1 : 0}>;`);
      lines.push(`${this.indent}${this.indent}pixel-mode = <${mipi.pixelMode}>;`);

      lines.push(`${this.indent}${this.indent}ports {`);
      lines.push(`${this.indent}${this.indent}${this.indent}port@0 {`);
      lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}mipi_in: endpoint {`);
      lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}${this.indent}remote-endpoint = <&sensor_out>;`);
      lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}};`);
      lines.push(`${this.indent}${this.indent}${this.indent}};`);

      for (let i = 0; i < mipi.virtualChannels; i++) {
        lines.push(`${this.indent}${this.indent}${this.indent}port@${i + 1} {`);
        lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}mipi_out_ch${i}: endpoint {`);
        lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}${this.indent}remote-endpoint = <&isp${i}_in>;`);
        lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}};`);
        lines.push(`${this.indent}${this.indent}${this.indent}};`);
      }

      lines.push(`${this.indent}${this.indent}};`);
      lines.push(`${this.indent}};`);
      lines.push('');
    });
  }

  private generateISP(lines: string[], core: 'main' | 'sub'): void {
    const ispConfigs = this.config.ispConfigs.filter(i => i.core === core);

    ispConfigs.forEach(isp => {
      lines.push(`${this.indent}${isp.name.toLowerCase()}: isp@0 {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,isp";`);
      lines.push(`${this.indent}${this.indent}status = "okay";`);
      lines.push(`${this.indent}${this.indent}cfa = <${isp.cfa}>;`);
      lines.push(`${this.indent}${this.indent}memory-sharing = <${isp.memorySharing ? 1 : 0}>;`);
      lines.push(`${this.indent}${this.indent}bypass-mode = <${isp.bypassMode ? 1 : 0}>;`);

      lines.push(`${this.indent}${this.indent}port {`);
      lines.push(`${this.indent}${this.indent}${this.indent}${isp.name.toLowerCase()}_in: endpoint {`);
      lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}remote-endpoint = <&mipi_out_ch0>;`);
      lines.push(`${this.indent}${this.indent}${this.indent}};`);
      lines.push(`${this.indent}${this.indent}};`);
      lines.push(`${this.indent}};`);
      lines.push('');
    });
  }

  private generateSVDW(lines: string[], core: 'main' | 'sub'): void {
    const svdwConfigs = this.config.svdwConfigs;
    const grabbers = svdwConfigs.filter(config => config.type === 'grabber');
    const blender = svdwConfigs.find(config => config.type === 'blender');

    // Generate SVDW Grabbers
    grabbers.forEach((grabber, index) => {
      lines.push(`${this.indent}${grabber.name.toLowerCase().replace(' ', '_')}: svdw-grabber@${index} {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,tcc-svdw-grabber";`);
      lines.push(`${this.indent}${this.indent}status = "${grabber.enabled ? 'okay' : 'disabled'}";`);
      lines.push(`${this.indent}${this.indent}grabber-id = <${index}>;`);
      
      // Add input port configuration
      if (grabber.inputPorts && grabber.inputPorts.length > 0) {
        lines.push(`${this.indent}${this.indent}input-ports = <${grabber.inputPorts.map(port => port.replace('port', '')).join(' ')}>;`);
      }

      lines.push(`${this.indent}};`);
      lines.push('');
    });

    // Generate SVDW Blender
    if (blender) {
      lines.push(`${this.indent}${blender.name.toLowerCase().replace(' ', '_')}: svdw-blender@0 {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,tcc-svdw-blender";`);
      lines.push(`${this.indent}${this.indent}status = "${blender.enabled ? 'okay' : 'disabled'}";`);
      
      // Add input port configuration for blender
      if (blender.inputPorts && blender.inputPorts.length > 0) {
        lines.push(`${this.indent}${this.indent}input-ports = <${blender.inputPorts.map(port => port.replace('port', '')).join(' ')}>;`);
      }

      lines.push(`${this.indent}};`);
      lines.push('');
    }
  }

  private generateVideoInput(lines: string[], core: 'main' | 'sub'): void {
    const vwdmaConfigs = this.config.vwdmaConfigs;

    vwdmaConfigs.forEach(vwdma => {
      lines.push(`${this.indent}${vwdma.name.toLowerCase()}: videoinput@0 {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,videoinput";`);
      lines.push(`${this.indent}${this.indent}status = "${vwdma.enabled ? 'okay' : 'disabled'}";`);

      if (vwdma.irEnabled) {
        lines.push(`${this.indent}${this.indent}ir-enable = <1>;`);
        if (vwdma.irEncoding) {
          lines.push(`${this.indent}${this.indent}ir-encoding = "${vwdma.irEncoding}";`);
        }
      }

      lines.push(`${this.indent}${this.indent}stream-enable = <1>;`);

      // Add cam-mux mappings
      const mappings = this.config.cameraMux.mappings;
      if (mappings.length > 0) {
        const camChValues = mappings.map(m => parseInt(m.output.replace('ch', '')));
        lines.push(`${this.indent}${this.indent}cam-ch = <${camChValues.join(' ')}>;`);
      }

      lines.push(`${this.indent}};`);
      lines.push('');
    });
  }

  private generateCIED(lines: string[], core: 'main' | 'sub'): void {
    const ciedConfigs = this.config.ciedConfigs.filter(c => c.enabled);

    ciedConfigs.forEach(cied => {
      lines.push(`${this.indent}${cied.name.toLowerCase()}: cied@0 {`);
      lines.push(`${this.indent}${this.indent}compatible = "telechips,cied";`);
      lines.push(`${this.indent}${this.indent}status = "okay";`);
      lines.push(`${this.indent}${this.indent}channel = <${cied.channel}>;`);
      lines.push(`${this.indent}${this.indent}format = "${cied.format}";`);

      if (cied.windows.length > 0) {
        lines.push(`${this.indent}${this.indent}windows {`);
        cied.windows.forEach(window => {
          lines.push(`${this.indent}${this.indent}${this.indent}window@${window.id} {`);
          lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}rect = <${window.rect.x} ${window.rect.y} ${window.rect.width} ${window.rect.height}>;`);
          lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}error-mode = "${window.errorMode}";`);
          lines.push(`${this.indent}${this.indent}${this.indent}${this.indent}threshold = <${window.threshold}>;`);
          lines.push(`${this.indent}${this.indent}${this.indent}};`);
        });
        lines.push(`${this.indent}${this.indent}};`);
      }

      lines.push(`${this.indent}};`);
      lines.push('');
    });
  }

  private generateMDW(lines: string[], core: 'main' | 'sub'): void {
    const mdw = this.config.mdwConfig;

    lines.push(`${this.indent}mdw: mdw@0 {`);
    lines.push(`${this.indent}${this.indent}compatible = "telechips,mdw";`);
    lines.push(`${this.indent}${this.indent}status = "okay";`);
    lines.push(`${this.indent}${this.indent}axi-read-outstanding = <${mdw.axiReadOutstanding}>;`);
    lines.push(`${this.indent}${this.indent}axi-write-outstanding = <${mdw.axiWriteOutstanding}>;`);
    lines.push(`${this.indent}${this.indent}default-color = "${mdw.defaultColor}";`);
    lines.push(`${this.indent}${this.indent}fisheye-mode = <${mdw.fisheyeMode ? 1 : 0}>;`);
    lines.push(`${this.indent}${this.indent}color-ir-enable = <${mdw.colorIrEnable ? 1 : 0}>;`);
    lines.push(`${this.indent}${this.indent}yuv-standard = "${mdw.yuvStandard}";`);
    lines.push(`${this.indent}};`);
    lines.push('');
  }
}