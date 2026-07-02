"use client";

import { useEffect, useRef } from "react";

let sharedShaderStartedAt: number | null = null;

export function ShaderOrb({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  const activeValueRef = useRef(active ? 1 : 0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true, powerPreference: "low-power" });
    if (!gl) return;

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_active;
      uniform vec2 u_resolution;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.05;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 p = uv - 0.5;
        float t = u_time * 0.56;
        float pulse = sin(u_time * 3.8 + fbm(p * 5.5) * 2.4);
        float breath = 0.5 + 0.5 * pulse;

        vec2 warp = vec2(
          fbm(p * 3.5 + vec2(t * 1.25, -t * 0.92)),
          fbm(p * 3.5 + vec2(-t * 0.82, t * 1.18))
        ) - 0.5;
        vec2 q = p + warp * (0.43 + breath * 0.08);

        float lime = smoothstep(0.58, 0.02, length(q - vec2(-0.25, 0.18)));
        float cyan = smoothstep(0.66, 0.03, length(q - vec2(0.23, 0.20)));
        float blue = smoothstep(0.72, 0.04, length(q - vec2(0.17, -0.28)));
        float teal = smoothstep(0.62, 0.03, length(q - vec2(-0.28, -0.24)));
        float cloud = fbm(q * 4.8 + vec2(t * 1.4, -t * 1.1));

        vec3 color = vec3(0.20, 0.76, 0.96);
        color = mix(color, vec3(0.74, 0.94, 0.32), lime * 0.9);
        color = mix(color, vec3(0.37, 0.86, 1.0), cyan);
        color = mix(color, vec3(0.02, 0.39, 0.70), blue * 0.85);
        color = mix(color, vec3(0.04, 0.72, 0.82), teal * 0.72);
        color += (cloud - 0.5) * (0.3 + u_active * 0.08);
        color *= 1.02 + breath * (0.12 + u_active * 0.22);

        float paperWash = fbm(uv * 9.0 + vec2(t * 0.03, -t * 0.02)) - 0.5;
        color += paperWash * 0.035;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "a_position");
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const activeUniform = gl.getUniformLocation(program, "u_active");
    const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    let frameId = 0;
    sharedShaderStartedAt ??= performance.now();
    const shaderStartedAt = sharedShaderStartedAt;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const render = () => {
      resize();
      // u_active를 매 프레임 lerp — 배경 움직임·밝기 모두 부드럽게 전환
      const target = activeRef.current ? 1 : 0;
      activeValueRef.current += (target - activeValueRef.current) * 0.035;
      gl.useProgram(program);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeUniform, (performance.now() - shaderStartedAt) / 1000);
      gl.uniform1f(activeUniform, activeValueRef.current);
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full rounded-full [clip-path:circle(50%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-35 mix-blend-soft-light [clip-path:circle(50%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(2deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 13px), repeating-linear-gradient(91deg, rgba(15,70,90,0.12) 0px, rgba(15,70,90,0.12) 1px, transparent 1px, transparent 19px)",
          filter: "blur(0.35px)",
        }}
        aria-hidden="true"
      />
      {active && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-full [clip-path:circle(50%)]"
          aria-hidden="true"
        >
          <div className="flex h-12 items-center gap-1.5 rounded-full bg-white/10 px-4 backdrop-blur-[1px]">
            {[18, 30, 22, 38, 26, 34, 20].map((height, index) => (
              <span
                key={index}
                className="w-1.5 rounded-full bg-white/85 shadow-[0_0_10px_rgba(255,255,255,0.45)]"
                style={{
                  height,
                  animationName: "shader-orb-voice-wave",
                  animationDuration: "780ms",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${index * 80}ms`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes shader-orb-voice-wave {
              0%, 100% { transform: scaleY(0.45); opacity: 0.55; }
              50%       { transform: scaleY(1);    opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
