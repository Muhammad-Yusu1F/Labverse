import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Flame, Activity, Wind } from 'lucide-react';

interface Volcano3DCanvasProps {
  isErupting: boolean;
  gasPressure: number; // 10 to 120 bar
  silicaContent: number; // 45 to 75 %
  magmaTemp: number; // 700 to 1200 °C
  ashHeightKm: number;
  eruptionType: string;
}

export const Volcano3DCanvas: React.FC<Volcano3DCanvasProps> = ({
  isErupting,
  gasPressure,
  silicaContent,
  magmaTemp,
  ashHeightKm,
  eruptionType,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic meshes & lights
  const magmaLakeMeshRef = useRef<THREE.Mesh | null>(null);
  const craterLightRef = useRef<THREE.PointLight | null>(null);
  const lavaFlowsGroupRef = useRef<THREE.Group | null>(null);

  // Particle systems
  const lavaSparksRef = useRef<THREE.Points | null>(null);
  const ashCloudRef = useRef<THREE.Points | null>(null);

  // Orbit Camera State
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.2, phi: 0.35, radius: 15.5 });

  // Seismic shake
  const shakeIntensityRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    // 1. SCENE with volcanic atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050711);
    scene.fog = new THREE.FogExp2(0x050711, 0.022);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    cameraRef.current = camera;

    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      const shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
      const shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
      
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi) + shakeX;
      camera.position.y = radius * Math.sin(phi) + 2.5 + shakeY;
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 2.0, 0);
    };
    updateCameraPos();

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.85);
    scene.add(ambientLight);

    // Moon / Atmospheric rim light
    const moonLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    moonLight.position.set(-10, 20, 15);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Intense glowing magma crater light
    const craterLight = new THREE.PointLight(0xff3300, 3.5, 24);
    craterLight.position.set(0, 4.4, 0);
    scene.add(craterLight);
    craterLightRef.current = craterLight;

    // 5. TERRAIN & TECTONIC BASE PLATE
    const terrainGroup = new THREE.Group();

    // Crust plate
    const crustGeom = new THREE.CylinderGeometry(14, 15, 0.8, 36);
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const crust = new THREE.Mesh(crustGeom, crustMat);
    crust.position.y = -0.4;
    crust.receiveShadow = true;
    terrainGroup.add(crust);

    // Subduction fault line glowing groove
    const faultGeom = new THREE.RingGeometry(8, 8.4, 36);
    const faultMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const fault = new THREE.Mesh(faultGeom, faultMat);
    fault.rotation.x = Math.PI / 2;
    fault.position.y = 0.02;
    terrainGroup.add(fault);

    // 6. PROCEDURAL REALISTIC STRATOVOLCANO CONE
    // We create a layered cone with a hollow crater at the top
    const mountainGeom = new THREE.CylinderGeometry(1.6, 7.8, 4.8, 36, 12, true);
    
    // Add realistic rocky irregularity to vertices
    const posAttr = mountainGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const angle = Math.atan2(posAttr.getZ(i), posAttr.getX(i));
      // Add natural ridges and valleys
      const ridge = Math.sin(angle * 7) * 0.35 + Math.cos(angle * 13) * 0.18;
      if (y < 2.0 && y > -2.0) {
        posAttr.setX(i, posAttr.getX(i) + Math.cos(angle) * ridge);
        posAttr.setZ(i, posAttr.getZ(i) + Math.sin(angle) * ridge);
      }
    }
    mountainGeom.computeVertexNormals();

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.88,
      metalness: 0.15,
      flatShading: true,
    });
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.y = 2.4;
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    terrainGroup.add(mountain);

    // Crater Rim lip
    const rimGeom = new THREE.TorusGeometry(1.6, 0.25, 12, 36);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 4.8;
    terrainGroup.add(rim);

    // Magma Lake Surface in the crater
    const magmaLakeGeom = new THREE.CircleGeometry(1.5, 36);
    const magmaLakeMat = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff4500,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.3,
    });
    const magmaLake = new THREE.Mesh(magmaLakeGeom, magmaLakeMat);
    magmaLake.rotation.x = -Math.PI / 2;
    magmaLake.position.y = 4.55;
    terrainGroup.add(magmaLake);
    magmaLakeMeshRef.current = magmaLake;

    // Glowing Lava River veins running down flanks
    const lavaFlowsGroup = new THREE.Group();
    const flowCount = 6;
    for (let f = 0; f < flowCount; f++) {
      const angle = (f / flowCount) * Math.PI * 2 + 0.3;
      const points: THREE.Vector3[] = [];
      const steps = 14;
      for (let s = 0; s < steps; s++) {
        const t = s / (steps - 1);
        const curY = THREE.MathUtils.lerp(4.6, 0.1, t);
        const curR = THREE.MathUtils.lerp(1.7, 7.2, t * t);
        const wiggle = Math.sin(s * 1.5 + f) * 0.4;
        points.push(
          new THREE.Vector3(
            Math.cos(angle + wiggle * 0.15) * curR,
            curY,
            Math.sin(angle + wiggle * 0.15) * curR
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.14, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff2200,
        emissiveIntensity: 1.6,
        roughness: 0.3,
      });
      const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
      lavaFlowsGroup.add(tubeMesh);
    }
    lavaFlowsGroup.visible = isErupting;
    lavaFlowsGroupRef.current = lavaFlowsGroup;
    terrainGroup.add(lavaFlowsGroup);

    scene.add(terrainGroup);

    // 7. MOLTEN LAVA BOMBS & ERUPTION FOUNTAIN PARTICLES
    const sparkCount = 280;
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel: { x: number; y: number; z: number; life: number; maxLife: number }[] = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 0;
      sparkPos[i * 3 + 1] = 4.6;
      sparkPos[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.22;
      const upVelocity = 0.2 + Math.random() * 0.45;
      sparkVel.push({
        x: Math.cos(angle) * speed,
        y: upVelocity,
        z: Math.sin(angle) * speed,
        life: Math.random() * 80,
        maxLife: 60 + Math.random() * 60,
      });
    }

    const sparkGeom = new THREE.BufferGeometry();
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.26,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
    sparkPoints.visible = isErupting;
    lavaSparksRef.current = sparkPoints;
    scene.add(sparkPoints);

    // 8. VOLCANIC ASH & PYROCLASTIC BILLOW PLUME
    const ashCount = 350;
    const ashPos = new Float32Array(ashCount * 3);
    const ashVel: { x: number; y: number; z: number; growth: number }[] = [];

    for (let i = 0; i < ashCount; i++) {
      ashPos[i * 3] = (Math.random() - 0.5) * 0.8;
      ashPos[i * 3 + 1] = 4.8 + Math.random() * 2.0;
      ashPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      ashVel.push({
        x: (Math.random() - 0.5) * 0.04,
        y: 0.05 + Math.random() * 0.09,
        z: (Math.random() - 0.5) * 0.04,
        growth: 1.0,
      });
    }

    const ashGeom = new THREE.BufferGeometry();
    ashGeom.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
    const ashMat = new THREE.PointsMaterial({
      color: 0x475569,
      size: 0.75,
      transparent: true,
      opacity: 0.5,
    });
    const ashPoints = new THREE.Points(ashGeom, ashMat);
    ashPoints.visible = isErupting;
    ashCloudRef.current = ashPoints;
    scene.add(ashPoints);

    // 9. ANIMATION & PHYSICS TICK LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Magma Lake boiling pulse
      if (magmaLakeMeshRef.current && craterLightRef.current) {
        const pulse = Math.sin(elapsed * 4) * 0.3 + 1.2;
        const mat = magmaLakeMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isErupting ? pulse * 2.2 : pulse * 1.1;
        craterLightRef.current.intensity = isErupting ? pulse * 4.5 : pulse * 2.0;
      }

      // Seismic Camera Shake during violent eruption
      if (isErupting) {
        shakeIntensityRef.current = (gasPressure / 120) * 0.09;
      } else {
        shakeIntensityRef.current = THREE.MathUtils.lerp(shakeIntensityRef.current, 0, 0.1);
      }
      updateCameraPos();

      // Animate Lava Sparks (physics: gravity + velocity)
      if (lavaSparksRef.current && isErupting) {
        lavaSparksRef.current.visible = true;
        const geom = lavaSparksRef.current.geometry;
        const pos = geom.attributes.position.array as Float32Array;

        const pressureFactor = gasPressure / 60;

        for (let i = 0; i < sparkCount; i++) {
          const v = sparkVel[i];
          pos[i * 3] += v.x * pressureFactor;
          pos[i * 3 + 1] += v.y * pressureFactor;
          pos[i * 3 + 2] += v.z * pressureFactor;

          // Gravity pulling molten rocks down
          v.y -= 0.008;
          v.life += 1;

          // If it hits the ground or dies, respawn in crater
          if (pos[i * 3 + 1] < 0.2 || v.life > v.maxLife) {
            pos[i * 3] = (Math.random() - 0.5) * 0.6;
            pos[i * 3 + 1] = 4.6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

            const angle = Math.random() * Math.PI * 2;
            const speed = (0.05 + Math.random() * 0.16) * pressureFactor;
            const upVelocity = (0.22 + Math.random() * 0.42) * pressureFactor;

            v.x = Math.cos(angle) * speed;
            v.y = upVelocity;
            v.z = Math.sin(angle) * speed;
            v.life = 0;
          }
        }
        geom.attributes.position.needsUpdate = true;
      } else if (lavaSparksRef.current) {
        lavaSparksRef.current.visible = false;
      }

      // Animate Ash Cloud billowing skyward
      if (ashCloudRef.current && isErupting) {
        ashCloudRef.current.visible = true;
        const geom = ashCloudRef.current.geometry;
        const pos = geom.attributes.position.array as Float32Array;
        const maxHeight = 5.0 + (ashHeightKm * 0.5);

        for (let i = 0; i < ashCount; i++) {
          const v = ashVel[i];
          pos[i * 3] += v.x + (Math.sin(elapsed + i) * 0.01);
          pos[i * 3 + 1] += v.y;
          pos[i * 3 + 2] += v.z + (Math.cos(elapsed + i) * 0.01);

          // Expands as it rises
          v.x *= 1.008;
          v.z *= 1.008;

          if (pos[i * 3 + 1] > maxHeight) {
            pos[i * 3] = (Math.random() - 0.5) * 0.6;
            pos[i * 3 + 1] = 4.8;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
            v.x = (Math.random() - 0.5) * 0.035;
            v.z = (Math.random() - 0.5) * 0.035;
          }
        }
        geom.attributes.position.needsUpdate = true;
      } else if (ashCloudRef.current) {
        ashCloudRef.current.visible = false;
      }

      // Lava flows glow
      if (lavaFlowsGroupRef.current) {
        lavaFlowsGroupRef.current.visible = isErupting;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Interactive Orbit Drag Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(1.2, cameraAngleRef.current.phi + deltaY * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(9, Math.min(26, cameraAngleRef.current.radius + e.deltaY * 0.015));
      updateCameraPos();
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      cameraAngleRef.current.theta -= deltaX * 0.01;
      cameraAngleRef.current.phi = Math.max(0.08, Math.min(1.2, cameraAngleRef.current.phi + deltaY * 0.01));
      updateCameraPos();
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasEl.removeEventListener('wheel', onWheel);
      canvasEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [isErupting, gasPressure, ashHeightKm]);

  const resetCamera = () => {
    cameraAngleRef.current = { theta: 0.2, phi: 0.35, radius: 15.5 };
    if (cameraRef.current) {
      const { theta, phi, radius } = cameraAngleRef.current;
      cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
      cameraRef.current.position.y = radius * Math.sin(phi) + 2.5;
      cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
      cameraRef.current.lookAt(0, 2.0, 0);
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-amber-500/30 bg-[#050711] shadow-[0_0_40px_rgba(0,0,0,0.85)]">
      
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Optical HUD: Status & Seismic Telemetry */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl liquid-glass border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center gap-2 pointer-events-auto backdrop-blur-md shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                isErupting ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-bold">
              {isErupting ? 'OTILISH FAOL (3D VULQON)' : '3D GEOLOGIK MODEL'}
            </span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">| KRATER & MAGMA</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-glass border border-rose-500/30 text-rose-300 text-[11px] font-mono pointer-events-auto backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>T: {magmaTemp}°C</span>
          </div>
        </div>

        {/* Camera Control Icons */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={resetCamera}
            title="Kamerani boshlang‘ich holatga qaytarish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.max(9, cameraAngleRef.current.radius - 2.0);
              if (cameraRef.current) {
                const { theta, phi, radius } = cameraAngleRef.current;
                cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
                cameraRef.current.position.y = radius * Math.sin(phi) + 2.5;
                cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
                cameraRef.current.lookAt(0, 2.0, 0);
              }
            }}
            title="Yaqinlashtirish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.min(26, cameraAngleRef.current.radius + 2.0);
              if (cameraRef.current) {
                const { theta, phi, radius } = cameraAngleRef.current;
                cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
                cameraRef.current.position.y = radius * Math.sin(phi) + 2.5;
                cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
                cameraRef.current.lookAt(0, 2.0, 0);
              }
            }}
            title="Uzoqlashtirish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom HUD Banner: Current Plume & Type */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 text-[11px] font-mono">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg liquid-glass border border-amber-400/40 text-amber-200 flex items-center gap-1.5 shadow-md">
            <span className="text-slate-400">Turi:</span>
            <span className="font-bold uppercase text-rose-300">{eruptionType}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg liquid-glass border border-cyan-400/40 text-cyan-200 flex items-center gap-1.5 shadow-md">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kul ustuni: <strong>{ashHeightKm} km</strong></span>
          </div>
        </div>

        <div className="hidden md:block text-[10px] text-slate-400 font-mono tracking-tight pointer-events-none">
          Vulqonni 360° orbital aylantirish uchun buring
        </div>
      </div>

    </div>
  );
};
