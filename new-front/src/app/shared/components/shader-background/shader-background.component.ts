import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-shader-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #shaderCanvas></canvas>`,
  styleUrl: './shader-background.component.css',
})
export class ShaderBackgroundComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('shaderCanvas');
  private readonly ngZone = inject(NgZone);

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private rafId = 0;
  private startTime = 0;
  private resizeObserver: ResizeObserver | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uResolution: WebGLUniformLocation | null = null;

  private readonly VERT_SRC = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  private readonly FRAG_SRC = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_resolution;

    // ── Brand palette ─────────────────────────────────────────
    vec3 cn1 = vec3(0.031, 0.071, 0.141); // #081224 base navy
    vec3 cn2 = vec3(0.063, 0.141, 0.376); // #102260 deep blue
    vec3 cn3 = vec3(0.094, 0.373, 0.647); // #185FA5 primary
    vec3 cn4 = vec3(0.216, 0.541, 0.867); // #378ADD accent
    vec3 cn5 = vec3(0.039, 0.094, 0.220); // #0a1838 dark navy
    vec3 cn6 = vec3(0.357, 0.655, 0.910); // #5ba7e8 highlight

    // Gaussian blob
    float blob(vec2 uv, vec2 center, float radius) {
      vec2 d = uv - center;
      return exp(-dot(d, d) / (radius * radius));
    }

    // Value noise for grain
    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = fract(sin(dot(i,             vec2(127.1, 311.7))) * 43758.5453);
      float b = fract(sin(dot(i+vec2(1,0),  vec2(127.1, 311.7))) * 43758.5453);
      float g = fract(sin(dot(i+vec2(0,1),  vec2(127.1, 311.7))) * 43758.5453);
      float h = fract(sin(dot(i+vec2(1,1),  vec2(127.1, 311.7))) * 43758.5453);
      return mix(mix(a, b, u.x), mix(g, h, u.x), u.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t  = u_time * 0.055;

      // ── Animated metablobs ────────────────────────────────────
      vec2 p1 = vec2(0.22+sin(t*0.70)*0.18, 0.74+cos(t*0.50)*0.16);
      vec2 p2 = vec2(0.74+cos(t*0.62)*0.20, 0.22+sin(t*0.78)*0.18);
      vec2 p3 = vec2(0.50+sin(t*0.42)*0.24, 0.50+cos(t*0.53)*0.20);
      vec2 p4 = vec2(0.12+cos(t*0.88)*0.12, 0.42+sin(t*0.63)*0.18);
      vec2 p5 = vec2(0.86+sin(t*0.52)*0.10, 0.64+cos(t*0.68)*0.14);
      vec2 p6 = vec2(0.40+cos(t*0.47)*0.22, 0.16+sin(t*0.58)*0.12);

      float w1=blob(uv,p1,0.38), w2=blob(uv,p2,0.42), w3=blob(uv,p3,0.52);
      float w4=blob(uv,p4,0.30), w5=blob(uv,p5,0.34), w6=blob(uv,p6,0.28);
      float total = w1+w2+w3+w4+w5+w6+0.001;
      vec3 col = (cn1*w1 + cn2*w2 + cn3*w3 + cn5*w4 + cn2*w5 + cn3*w6) / total;

      // ── Aurora diagonal bands ─────────────────────────────────
      float a1 = smoothstep(0.18,0.0, abs(uv.y-(0.38+sin(t*0.30)*0.08)-uv.x*0.25)) * 0.30;
      float a2 = smoothstep(0.14,0.0, abs(uv.y-(0.62+cos(t*0.40)*0.07)-uv.x*0.15)) * 0.20;
      float a3 = smoothstep(0.10,0.0, abs(uv.y-(0.80+sin(t*0.50)*0.05)+uv.x*0.10)) * 0.14;
      col = mix(col, cn4, a1);
      col = mix(col, cn6, a2);
      col = mix(col, cn3, a3);

      // ── Soft dot grid ─────────────────────────────────────────
      vec2 gridUV = fract(gl_FragCoord.xy / 34.0 + 0.5);
      float dotVal = 1.0 - smoothstep(0.04, 0.12, length(gridUV - 0.5));
      col += dotVal * cn4 * 0.08;

      // ── Radial glow from bottom-centre ───────────────────────
      float glow = exp(-length(uv - vec2(0.5, 0.0)) * 2.6);
      col = mix(col, cn4, glow * 0.24);

      // ── Vignette ─────────────────────────────────────────────
      vec2 vigUV = uv * 2.0 - 1.0;
      float vig  = 1.0 - dot(vigUV * vec2(0.5, 0.65), vigUV * vec2(0.5, 0.65));
      col *= 0.45 + 0.55 * clamp(vig, 0.0, 1.0);

      // ── Animated micro-grain ──────────────────────────────────
      col += (valueNoise(gl_FragCoord.xy * 0.7 + t * 30.0) - 0.5) * 0.022;

      // ── Firefly particles ─────────────────────────────────────
      float tf = u_time * 0.28;
      vec2 ff1 = vec2(0.14+sin(tf*1.30)*0.10, 0.30+cos(tf*0.90)*0.16);
      vec2 ff2 = vec2(0.79+cos(tf*0.75)*0.11, 0.52+sin(tf*1.15)*0.17);
      vec2 ff3 = vec2(0.44+sin(tf*1.55)*0.13, 0.76+cos(tf*0.82)*0.11);
      vec2 ff4 = vec2(0.63+cos(tf*1.25)*0.10, 0.22+sin(tf*1.38)*0.10);
      vec2 ff5 = vec2(0.30+sin(tf*0.65)*0.15, 0.46+cos(tf*1.45)*0.13);
      vec2 ff6 = vec2(0.87+cos(tf*1.08)*0.09, 0.40+sin(tf*0.78)*0.15);
      float ffr = 0.013;
      float ffall = exp(-dot(uv-ff1,uv-ff1)/(ffr*ffr*1.3))
                  + exp(-dot(uv-ff2,uv-ff2)/(ffr*ffr))
                  + exp(-dot(uv-ff3,uv-ff3)/(ffr*ffr*0.8))
                  + exp(-dot(uv-ff4,uv-ff4)/(ffr*ffr*1.1))
                  + exp(-dot(uv-ff5,uv-ff5)/(ffr*ffr*0.9))
                  + exp(-dot(uv-ff6,uv-ff6)/(ffr*ffr));
      col += clamp(ffall, 0.0, 0.92) * cn6 * 0.82;

      // ── Light beam (vertical shimmer, left-centre) ────────────
      float beam = exp(-pow((uv.x - (0.32 + sin(t*0.18)*0.05)) * 8.0, 2.0));
      beam *= smoothstep(0.0, 0.4, uv.y) * smoothstep(1.0, 0.5, uv.y);
      col += beam * cn4 * 0.06;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initWebGL());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
  }

  private initWebGL(): void {
    const canvas = this.canvasRef().nativeElement;
    const gl = (
      canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;

    if (!gl) { this.fallbackCSS(canvas); return; }
    this.gl = gl;

    const vert = this.compile(gl, gl.VERTEX_SHADER, this.VERT_SRC);
    const frag = this.compile(gl, gl.FRAGMENT_SHADER, this.FRAG_SRC);
    if (!vert || !frag) { this.fallbackCSS(canvas); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { this.fallbackCSS(canvas); return; }

    this.program = prog;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    this.uTime = gl.getUniformLocation(prog, 'u_time');
    this.uResolution = gl.getUniformLocation(prog, 'u_resolution');
    this.startTime = performance.now();

    this.resize(canvas, gl);
    this.resizeObserver = new ResizeObserver(() => this.resize(canvas, gl!));
    this.resizeObserver.observe(canvas.parentElement ?? document.body);

    this.loop();
  }

  private compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }

  private resize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): void {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  private loop = (): void => {
    if (!this.gl) return;
    const t = (performance.now() - this.startTime) / 1000;
    this.gl.uniform1f(this.uTime, t);
    this.gl.uniform2f(this.uResolution, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private fallbackCSS(canvas: HTMLCanvasElement): void {
    canvas.style.display = 'none';
    canvas.parentElement?.classList.add('auth-bg-fallback');
  }
}
