"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Settings, Wind, 
  Activity, Layers, MousePointer2, 
  Grid, Square, Circle, Gauge, Upload, PenTool, Eraser, Car, ChevronsRight, AlignJustify, AlignLeft, Waves, ShieldCheck, Droplets
} from 'lucide-react';

/**
 * =========================================================================
 * MOTOR DE FÍSICA DE FLUIDOS (CFD SOLVER) - v11.0 SMOOTH SMOKE
 * =========================================================================
 */

const NX = 320; 
const NY = 160;
const SIZE = (NX + 2) * (NY + 2);
const ITER = 20; 

class FluidSolver {
  constructor() {
    this.dt = 0.015; 
    this.diff = 0.0000; 
    this.visc = 0.0000;
    this.vorticityConfinement = 5.0; 
    
    this.s = new Float32Array(SIZE);       
    this.density = new Float32Array(SIZE); 
    
    this.Vx = new Float32Array(SIZE);      
    this.Vy = new Float32Array(SIZE);      
    
    this.Vx0 = new Float32Array(SIZE);     
    this.Vy0 = new Float32Array(SIZE);     

    this.pressure = new Float32Array(SIZE); 
    this.curl = new Float32Array(SIZE);     
    
    this.obstacles = new Uint8Array(SIZE); 
  }

  IX(x, y) {
    x = Math.max(0, Math.min(x, NX + 1));
    y = Math.max(0, Math.min(y, NY + 1));
    return x + (NX + 2) * y;
  }

  addDensity(x, y, amount) {
    const index = this.IX(x, y);
    this.density[index] += amount;
    // Clamp suave para evitar saturación de color y ruido visual
    if(this.density[index] > 255) this.density[index] = 255; 
  }

  addVelocity(x, y, amountX, amountY) {
    const index = this.IX(x, y);
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  setObstacle(x, y, isWall) {
    const index = this.IX(x, y);
    this.obstacles[index] = isWall ? 1 : 0;
    if (isWall) {
        this.Vx[index] = 0;
        this.Vy[index] = 0;
        this.pressure[index] = 0;
    }
  }

  setBoundaries(b, x) {
    for (let j = 1; j <= NY; j++) {
      if (b === 1) x[this.IX(0, j)] = x[this.IX(1, j)]; 
      else x[this.IX(0, j)] = 0;
      x[this.IX(NX + 1, j)] = x[this.IX(NX, j)]; 
    }
    for (let i = 1; i <= NX; i++) {
      x[this.IX(i, 0)]      = b === 2 ? -x[this.IX(i, 1)]      : x[this.IX(i, 1)];
      x[this.IX(i, NY + 1)] = b === 2 ? -x[this.IX(i, NY)]     : x[this.IX(i, NY)];
    }
    x[this.IX(0, 0)]           = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, NY + 1)]      = 0.5 * (x[this.IX(1, NY + 1)] + x[this.IX(0, NY)]);
    x[this.IX(NX + 1, 0)]      = 0.5 * (x[this.IX(NX, 0)] + x[this.IX(NX + 1, 1)]);
    x[this.IX(NX + 1, NY + 1)] = 0.5 * (x[this.IX(NX, NY + 1)] + x[this.IX(NX + 1, NY)]);

    for (let j = 1; j <= NY; j++) {
      for (let i = 1; i <= NX; i++) {
        if (this.obstacles[this.IX(i, j)] === 1) {
          x[this.IX(i, j)] = 0; 
        }
      }
    }
  }

  lin_solve(b, x, x0, a, c) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < ITER; k++) {
      for (let j = 1; j <= NY; j++) {
        for (let i = 1; i <= NX; i++) {
          if (this.obstacles[this.IX(i, j)] === 1) continue;
          x[this.IX(i, j)] = (x0[this.IX(i, j)] + a * (x[this.IX(i + 1, j)] + x[this.IX(i - 1, j)] + x[this.IX(i, j + 1)] + x[this.IX(i, j - 1)])) * cRecip;
        }
      }
      this.setBoundaries(b, x);
    }
  }

  project(velocX, velocY, p, div) {
    const h = 1.0 / Math.sqrt(NX * NY);
    for (let j = 1; j <= NY; j++) {
      for (let i = 1; i <= NX; i++) {
        if (this.obstacles[this.IX(i, j)] === 1) {
             div[this.IX(i, j)] = 0;
             p[this.IX(i, j)] = 0;
             continue;
        }
        div[this.IX(i, j)] = -0.5 * h * (velocX[this.IX(i + 1, j)] - velocX[this.IX(i - 1, j)] + velocY[this.IX(i, j + 1)] - velocY[this.IX(i, j - 1)]);
        p[this.IX(i, j)] = 0;
      }
    }
    this.setBoundaries(0, div);
    this.setBoundaries(0, p);
    this.lin_solve(0, p, div, 1, 4);

    for (let j = 1; j <= NY; j++) {
      for (let i = 1; i <= NX; i++) {
        if (this.obstacles[this.IX(i, j)] === 1) continue;
        velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) / h;
        velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) / h;
      }
    }
    this.setBoundaries(1, velocX);
    this.setBoundaries(2, velocY);
  }

  advect(b, d, d0, velocX, velocY, dt) {
    let i0, i1, j0, j1;
    let x, y, s0, t0, s1, t1;
    const dt0 = dt * NX; 

    for (let j = 1; j <= NY; j++) {
      for (let i = 1; i <= NX; i++) {
         if (this.obstacles[this.IX(i, j)] === 1) continue;
        x = i - dt0 * velocX[this.IX(i, j)];
        y = j - dt0 * velocY[this.IX(i, j)];
        if (x < 0.5) x = 0.5; if (x > NX + 0.5) x = NX + 0.5;
        i0 = Math.floor(x); i1 = i0 + 1;
        if (y < 0.5) y = 0.5; if (y > NY + 0.5) y = NY + 0.5;
        j0 = Math.floor(y); j1 = j0 + 1;
        s1 = x - i0; s0 = 1.0 - s1; t1 = y - j0; t0 = 1.0 - t1;
        d[this.IX(i, j)] = s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) + s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
      }
    }
    this.setBoundaries(b, d);
  }

  vorticityConfinementStep(velocX, velocY) {
      let dx, dy, len;
      // 1. Calcular rotacional (curl)
      for (let j = 1; j < NY; j++) {
          for (let i = 1; i < NX; i++) {
              const dv_dx = (velocY[this.IX(i+1, j)] - velocY[this.IX(i-1, j)]) * 0.5;
              const du_dy = (velocX[this.IX(i, j+1)] - velocX[this.IX(i, j-1)]) * 0.5;
              this.curl[this.IX(i,j)] = Math.abs(dv_dx - du_dy);
          }
      }

      // 2. Aplicar fuerza correctiva con SUAVIZADO
      for (let j = 2; j < NY - 1; j++) {
          for (let i = 2; i < NX - 1; i++) {
              if (this.obstacles[this.IX(i, j)] === 1) continue;

              const dcurl_dx = (this.curl[this.IX(i+1, j)] - this.curl[this.IX(i-1, j)]) * 0.5;
              const dcurl_dy = (this.curl[this.IX(i, j+1)] - this.curl[this.IX(i, j-1)]) * 0.5;
              
              // Evitar división por cero y singularidades (causantes de puntos negros)
              len = Math.sqrt(dcurl_dx * dcurl_dx + dcurl_dy * dcurl_dy) + 0.0001;
              dx = dcurl_dx / len;
              dy = dcurl_dy / len;

              const curlRaw = (velocY[this.IX(i+1, j)] - velocY[this.IX(i-1, j)]) - (velocX[this.IX(i, j+1)] - velocX[this.IX(i, j-1)]);
              
              // CLAMP DE SEGURIDAD: Reducido a +/- 0.1 para evitar picos de ruido
              let forceX = this.dt * this.vorticityConfinement * (dy * curlRaw * -1);
              let forceY = this.dt * this.vorticityConfinement * (dx * curlRaw);
              
              forceX = Math.max(-0.1, Math.min(0.1, forceX)); 
              forceY = Math.max(-0.1, Math.min(0.1, forceY));

              velocX[this.IX(i, j)] += forceX;
              velocY[this.IX(i, j)] += forceY;
          }
      }
  }

  checkHealth() {
      let healthy = true;
      for(let i=0; i<SIZE; i+=200) {
          if (isNaN(this.Vx[i]) || isNaN(this.density[i])) { healthy = false; break; }
      }
      if (!healthy) this.clear();
  }

  step() {
    this.lin_solve(1, this.Vx0, this.Vx, this.visc, 1 + 4 * this.visc);
    this.lin_solve(2, this.Vy0, this.Vy, this.visc, 1 + 4 * this.visc);
    this.project(this.Vx0, this.Vy0, this.Vx, this.Vy); 
    
    if (this.vorticityConfinement > 0) this.vorticityConfinementStep(this.Vx0, this.Vy0);

    this.advect(1, this.Vx, this.Vx0, this.Vx0, this.Vy0, this.dt);
    this.advect(2, this.Vy, this.Vy0, this.Vx0, this.Vy0, this.dt);
    this.project(this.Vx, this.Vy, this.pressure, this.Vx0);
    this.lin_solve(0, this.s, this.density, this.diff, 1 + 4 * this.diff);
    this.advect(0, this.density, this.s, this.Vx, this.Vy, this.dt);
    this.checkHealth(); 

    for (let j = 1; j < NY; j++) {
        for (let i = 1; i < NX; i++) {
            const dv_dx = (this.Vy[this.IX(i+1, j)] - this.Vy[this.IX(i-1, j)]) * 0.5;
            const du_dy = (this.Vx[this.IX(i, j+1)] - this.Vx[this.IX(i, j-1)]) * 0.5;
            this.curl[this.IX(i,j)] = dv_dx - du_dy;
        }
    }
  }

  clear() {
    this.density.fill(0); this.s.fill(0); this.Vx.fill(0); this.Vy.fill(0);
    this.pressure.fill(0); this.Vx0.fill(0); this.Vy0.fill(0);
  }
}

const getJetColor = (t) => {
    t = Math.max(0, Math.min(1, t));
    let r = 0, g = 0, b = 0;
    if (t < 0.25) { b = 255; g = Math.floor(255 * (t / 0.25)); } 
    else if (t < 0.5) { b = Math.floor(255 * (1 - (t - 0.25) / 0.25)); g = 255; } 
    else if (t < 0.75) { g = 255; r = Math.floor(255 * ((t - 0.5) / 0.25)); } 
    else { r = 255; g = Math.floor(255 * (1 - (t - 0.75) / 0.25)); }
    return [r, g, b, 255];
};

const getColor = (val, min, max, mode) => {
    let t = (val - min) / (max - min);
    if (mode === 'density') {
        // Protección anti-NaN visual y clamp
        if (isNaN(val)) val = 0;
        const d = Math.max(0, Math.min(255, val));
        if (d < 5) return [0,0,0,255]; 
        // Tinte de humo azulado suave
        return [d * 0.9, d * 1.05, d * 1.2, 255]; 
    }
    if (mode === 'velocity' || mode === 'pressure') return getJetColor(t);
    if (mode === 'vorticity') {
        t = Math.max(0, Math.min(1, t));
        if (t < 0.5) { const i = (0.5 - t) * 2 * 255; return [0, i, i, 255]; } 
        else { const i = (t - 0.5) * 2 * 255; return [i, i * 0.5, 0, 255]; }
    }
    return [0,0,0,0];
};

export default function FluidSimulatorPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const solverRef = useRef(new FluidSolver());
  const requestRef = useRef();

  const [isPlaying, setIsPlaying] = useState(true);
  const [config, setConfig] = useState({
    viscosity: 0.000,
    diffusion: 0.0000,
    windTunnel: true,
    kmhSpeed: 120, 
    vorticity: 5, // Reducido el máximo para estabilidad
    dt: 0.1
  });

  const [viewMode, setViewMode] = useState('density'); 
  const [interactionMode, setInteractionMode] = useState('fluid'); 
  const [shape, setShape] = useState('f1'); 
  const [smokeMode, setSmokeMode] = useState('lines'); 
  const [probe, setProbe] = useState({ x: 0, y: 0, active: false, data: null });

  const initObstacles = useCallback((shapeType, customImageData = null) => {
    const solver = solverRef.current;
    solver.obstacles.fill(0);
    const cx = NX / 4; 
    const cy = NY / 2;
    
    if (shapeType === 'custom' && customImageData) {
        for (let j = 0; j < NY; j++) {
            for (let i = 0; i < NX; i++) {
                const idx = (j * NX + i) * 4;
                const alpha = customImageData.data[idx + 3];
                const brightness = (customImageData.data[idx] + customImageData.data[idx+1] + customImageData.data[idx+2]) / 3;
                if (alpha > 100 && brightness < 200) solver.obstacles[solver.IX(i+1, j+1)] = 1;
            }
        }
        return;
    }

    for (let j = 0; j < NY+2; j++) {
      for (let i = 0; i < NX+2; i++) {
        let isWall = false;
        if (shapeType === 'circle') { if ((i - cx)**2 + (j - cy)**2 < (NY/8)**2) isWall = true; } 
        else if (shapeType === 'square') { if (Math.abs(i - cx) < NY/8 && Math.abs(j - cy) < NY/8) isWall = true; } 
        else if (shapeType === 'airfoil') {
             const chord = NY / 1.5; 
             let xLocal = (i - (cx - chord/3)) / chord; let yLocal = (j - cy) / chord; 
             if (xLocal >= 0 && xLocal <= 1) {
                 const yt = 0.6 * (0.2969*Math.sqrt(xLocal) - 0.1260*xLocal - 0.3516*xLocal**2 + 0.2843*xLocal**3 - 0.1015*xLocal**4);
                 const angle = 12 * (Math.PI/180);
                 const yRot = yLocal * Math.cos(angle) - xLocal * Math.sin(angle);
                 if (Math.abs(yRot) < yt) isWall = true;
             }
        } else if (shapeType === 'venturi') {
            const width = NY; const center = NY/2; const constriction = 0.4; 
            const pipeWall = (Math.cos((i / NX) * Math.PI * 2 + Math.PI) + 1) * 0.5; 
            const heightAtX = (width/2) * (1 - pipeWall * (1-constriction));
            if (Math.abs(j - center) > heightAtX) isWall = true;
        } else if (shapeType === 'f1') {
             const scale = 1.0; const carX = (i - cx) * scale; const carY = (j - (cy + 30)) * scale; 
             const inBody = (Math.abs(carX) < 50 && Math.abs(carY) < 12); 
             const inFrontWing = (carX < -55 && carX > -70 && Math.abs(carY + 6) < 4); 
             const inRearWing = (carX > 55 && carX < 70 && Math.abs(carY - 18) < 5); 
             const inWheels = ((Math.abs(carX + 40) < 15 || Math.abs(carX - 40) < 15) && Math.abs(carY) < 15); 
             const inDiffuser = (carX > 35 && carX < 55 && carY > 6 && carY < 18 && (carY - 6) < (carX - 35)); 
             if (inBody || inFrontWing || inRearWing || inWheels || inDiffuser) isWall = true;
             if (j > NY - 5) isWall = true;
        }
        if (isWall) solver.obstacles[solver.IX(i, j)] = 1;
      }
    }
  }, []);

  useEffect(() => { initObstacles(shape); }, [shape, initObstacles]);

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = NX; tempCanvas.height = NY;
              const tempCtx = tempCanvas.getContext('2d');
              tempCtx.fillStyle = 'white'; tempCtx.fillRect(0, 0, NX, NY);
              const scale = Math.min(NX / img.width, NY / img.height) * 0.8;
              const x = (NX - img.width * scale) / 2; const y = (NY - img.height * scale) / 2;
              tempCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
              const imageData = tempCtx.getImageData(0, 0, NX, NY);
              setShape('custom'); initObstacles('custom', imageData);
          };
          img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  };

  const animate = useCallback((time) => {
    const solver = solverRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    solver.visc = config.viscosity;
    solver.diff = config.diffusion;
    solver.vorticityConfinement = config.vorticity; 
    solver.dt = config.dt;

    if (config.windTunnel && isPlaying) {
      const physicsSpeed = config.kmhSpeed * 0.002; 
      const displacement = Math.abs(physicsSpeed * solver.dt * NX);
      const injectionWidth = Math.ceil(displacement) + 3; 
      const timeSec = time * 0.001;
      const noise = Math.sin(timeSec * 5) * 0.02; 

      for (let j = 1; j <= NY; j++) {
          for(let k=0; k<Math.max(2, injectionWidth); k++) {
            if(1+k < NX) {
                solver.Vx[solver.IX(1+k, j)] = physicsSpeed;
                solver.Vy[solver.IX(1+k, j)] = noise * physicsSpeed; 
            }
          }
          if (smokeMode === 'mass') {
               for(let w=0; w<injectionWidth; w++) {
                    if(1+w < NX) solver.density[solver.IX(1+w, j)] = 250;
               }
          } else {
              let interval = 10;
              if (shape === 'f1' && j > NY - 40) interval = 5;
              if (j % interval === 0) {
                   for(let w=0; w<injectionWidth; w++) {
                        if(1+w < NX) solver.density[solver.IX(1+w, j)] = 250;
                   }
              } else {
                   for(let w=0; w<injectionWidth; w++) {
                        if(1+w < NX && j % interval !== 0 && j % interval !== 1 && j % interval !== interval-1) {
                             solver.density[solver.IX(1+w, j)] = 0;
                        }
                   }
              }
          }
      }
    }

    if (isPlaying) solver.step();

    const width = NX + 2;
    const height = NY + 2;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minVal = 0, maxVal = 1;
    if (viewMode === 'velocity') {
        maxVal = 0;
        for(let i=0; i<SIZE; i+=10) { 
             const v = Math.sqrt(solver.Vx[i]**2 + solver.Vy[i]**2);
             if(v > maxVal) maxVal = v;
        }
        if(maxVal < 0.001) maxVal = 0.01;
    } else if (viewMode === 'pressure') {
        minVal = Infinity; maxVal = -Infinity;
        for(let i=0; i<SIZE; i+=10) { 
             const p = solver.pressure[i];
             if(p < minVal) minVal = p;
             if(p > maxVal) maxVal = p;
        }
        if (Math.abs(maxVal - minVal) < 0.0001) { maxVal = minVal + 0.001; }
    }

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const idx = solver.IX(i, j);
        const pxIdx = (j * width + i) * 4;

        if (solver.obstacles[idx] === 1) {
            data[pxIdx] = 60; data[pxIdx + 1] = 65; data[pxIdx + 2] = 75; data[pxIdx + 3] = 255;
            continue;
        }

        let color = [0,0,0,255]; 
        if (viewMode === 'density') color = getColor(solver.density[idx], 0, 255, 'density');
        else if (viewMode === 'velocity') {
            const v = Math.sqrt(solver.Vx[idx]**2 + solver.Vy[idx]**2);
            color = getColor(v, 0, maxVal, 'velocity');
        } else if (viewMode === 'pressure') color = getColor(solver.pressure[idx], minVal, maxVal, 'pressure');
        else if (viewMode === 'vorticity') color = getColor(solver.curl[idx], -0.2, 0.2, 'vorticity'); 

        data[pxIdx] = color[0]; data[pxIdx + 1] = color[1]; data[pxIdx + 2] = color[2]; data[pxIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, config, viewMode, shape, smokeMode]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  const handleInteraction = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = (NX + 2) / rect.width;
    const scaleY = (NY + 2) / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x < 1 || x > NX || y < 1 || y > NY) {
        setProbe({ ...probe, active: false }); return;
    }
    const solver = solverRef.current;
    const idx = solver.IX(x, y);
    const vel = (Math.sqrt(solver.Vx[idx]**2 + solver.Vy[idx]**2) * 500).toFixed(0); 
    const press = (solver.pressure[idx] * 1000).toFixed(1);
    
    setProbe({
        x: clientX - rect.left, y: clientY - rect.top, active: true,
        data: { velocity: vel, pressure: press, x, y }
    });

    if (e.buttons === 1) { 
        if (interactionMode === 'wall') {
            for(let dy=-2; dy<=2; dy++) for(let dx=-2; dx<=2; dx++) solver.setObstacle(x+dx, y+dy, true);
        } else if (interactionMode === 'erase') {
            for(let dy=-3; dy<=3; dy++) for(let dx=-3; dx<=3; dx++) solver.setObstacle(x+dx, y+dy, false);
        } else {
            solver.addDensity(x, y, 150);
            solver.addVelocity(x, y, (e.movementX||0)*0.5, (e.movementY||0)*0.5);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Wind size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AeroLab CFD <span className="text-slate-500 font-normal text-xs ml-2">v11.0 (Smooth Smoke)</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        isPlaying ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span className="hidden sm:inline">{isPlaying ? 'Pausa' : 'Simular'}</span>
                </button>
                <button onClick={() => solverRef.current.clear()} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                    <RotateCcw size={16} />
                </button>
             </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SIMULATION */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div 
            ref={containerRef}
            className="relative w-full aspect-[2/1] bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden cursor-crosshair group"
            onMouseMove={handleInteraction} onMouseDown={handleInteraction} onMouseLeave={() => setProbe(p => ({...p, active: false}))} onTouchMove={handleInteraction}
          >
            {/* CSS hack para suavizar píxeles */}
            <canvas ref={canvasRef} width={NX+2} height={NY+2} className="w-full h-full" style={{ imageRendering: 'auto' }} />
            
            {probe.active && probe.data && (
                <div className="absolute pointer-events-none z-10 bg-slate-900/95 backdrop-blur border border-slate-700 p-2 rounded shadow-xl text-[10px] space-y-1 transform -translate-x-1/2 -translate-y-full mt-[-15px]" style={{ left: probe.x, top: probe.y }}>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span className="text-slate-500">Vel:</span> <span className="font-mono text-cyan-400">{probe.data.velocity} km/h</span>
                        <span className="text-slate-500">Press:</span> <span className="font-mono text-yellow-400">{probe.data.pressure}</span>
                    </div>
                </div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-1 bg-slate-900/80 backdrop-blur border border-slate-700 p-1 rounded-lg">
                {[
                    { id: 'fluid', icon: MousePointer2, label: 'Interactuar' },
                    { id: 'wall', icon: PenTool, label: 'Dibujar Pared' },
                    { id: 'erase', icon: Eraser, label: 'Borrar' },
                ].map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setInteractionMode(tool.id)}
                        title={tool.label}
                        className={`p-2 rounded transition-colors ${interactionMode === tool.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        <tool.icon size={18} />
                    </button>
                ))}
            </div>

            <div className="absolute bottom-4 left-4 flex gap-1 bg-slate-900/80 backdrop-blur border border-slate-700 p-1 rounded-lg">
                 <button onClick={() => setSmokeMode('mass')} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${smokeMode === 'mass' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                    <AlignJustify size={14} /> Bloque
                </button>
                <button onClick={() => setSmokeMode('lines')} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${smokeMode === 'lines' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                    <AlignLeft size={14} /> Líneas
                </button>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
             {[
                { id: 'density', label: 'Humo', icon: Layers },
                { id: 'velocity', label: 'Velocidad', icon: Activity },
                { id: 'pressure', label: 'Presión', icon: Gauge },
            ].map((mode) => (
                <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${viewMode === mode.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'}`}>
                    <mode.icon size={14} /> {mode.label}
                </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="lg:col-span-3 space-y-4 h-full overflow-y-auto pr-1">
            
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Grid size={14} /> Geometría</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <button onClick={() => setShape('f1')} className={`flex flex-col items-center p-2 rounded border ${shape === 'f1' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}>
                        <Car size={18} className="mb-1" /> <span className="text-[9px]">F1 Car</span>
                    </button>
                    <button onClick={() => setShape('venturi')} className={`flex flex-col items-center p-2 rounded border ${shape === 'venturi' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}>
                        <ChevronsRight size={18} className="mb-1" /> <span className="text-[9px]">Venturi</span>
                    </button>
                    <button onClick={() => setShape('airfoil')} className={`flex flex-col items-center p-2 rounded border ${shape === 'airfoil' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}>
                        <Wind size={18} className="mb-1" /> <span className="text-[9px]">Ala</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setShape('circle')} className={`flex flex-col items-center p-2 rounded border ${shape === 'circle' ? 'bg-slate-700 text-white' : 'border-slate-800 text-slate-500'}`}>
                        <Circle size={14} /> <span className="text-[9px] mt-1">Cilindro</span>
                    </button>
                    <button onClick={() => setShape('square')} className={`flex flex-col items-center p-2 rounded border ${shape === 'square' ? 'bg-slate-700 text-white' : 'border-slate-800 text-slate-500'}`}>
                        <Square size={14} /> <span className="text-[9px] mt-1">Cubo</span>
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <label className="flex items-center justify-center gap-2 w-full p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded cursor-pointer transition-colors border border-dashed border-slate-600">
                        <Upload size={14} />
                        <span>Importar Imagen / Silueta</span>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Settings size={14} /> Física</h3>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Velocidad Túnel</span><span className="text-cyan-400">{config.kmhSpeed} km/h</span></div>
                    <input type="range" min="0" max="350" step="5" value={config.kmhSpeed} onChange={(e) => setConfig({...config, kmhSpeed: Number(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Turbulencia (Vorticidad)</span><span className="text-purple-400">{config.vorticity.toFixed(1)}</span></div>
                    <div className="flex items-center gap-2">
                        <Waves size={14} className="text-slate-500" />
                        {/* Rango limitado a 20 para seguridad */}
                        <input type="range" min="0" max="20" step="1" value={config.vorticity} onChange={(e) => setConfig({...config, vorticity: Number(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Viscosidad</span><span className="text-cyan-400">{config.viscosity.toFixed(4)}</span></div>
                    <div className="flex items-center gap-2">
                        <Droplets size={14} className="text-slate-500" />
                        <input type="range" min="0.0000" max="0.0010" step="0.0001" value={config.viscosity} onChange={(e) => setConfig({...config, viscosity: Number(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                </div>
            </div>
            
            <div className="bg-indigo-900/20 border border-indigo-500/20 p-3 rounded text-[10px] text-indigo-300 flex gap-2">
                <ShieldCheck size={32} className="text-indigo-400 shrink-0" />
                <div>
                    <p className="font-bold mb-1">Estabilidad Activa</p>
                    <p>El motor ahora incluye un filtro de suavizado para mantener la apariencia de humo incluso a alta turbulencia.</p>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}