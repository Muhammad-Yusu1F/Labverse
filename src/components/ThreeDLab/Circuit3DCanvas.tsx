import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Zap, 
  Sparkles, 
  Power, 
  Layers
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface Circuit3DCanvasProps {
  voltage: number;
  resistance: number;
  isSwitchClosed: boolean;
  hasBulb: boolean;
  hasResistor: boolean;
  hasAmmeter: boolean;
  wireConnected: boolean;
  bulbBroken: boolean;
  onToggleSwitch: () => void;
}

export const Circuit3DCanvas: React.FC<Circuit3DCanvasProps> = ({
  voltage,
  resistance,
  isSwitchClosed,
  hasBulb,
  hasResistor,
  hasAmmeter,
  wireConnected,
  bulbBroken,
  onToggleSwitch
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bulbLightRef = useRef<THREE.PointLight | null>(null);
  const bulbFilamentRef = useRef<THREE.Mesh | null>(null);
  const switchBladeRef = useRef<THREE.Group | null>(null);
  const meterNeedleRef = useRef<THREE.Mesh | null>(null);
  const electronParticlesRef = useRef<THREE.Points | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 10.5 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.5, 0));

  // Current calculation
  const totalResistance = resistance + (hasBulb ? 2 : 0);
  const current = (isSwitchClosed && wireConnected && !bulbBroken)
    ? voltage / totalResistance
    : 0;

  const bulbBrightness = Math.min(1.5, current / 1.6);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070d1a);
    scene.fog = new THREE.FogExp2(0x070d1a, 0.04);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Room Lighting (Ceiling ambient + Soft Studio lights)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const ceilingLight = new THREE.DirectionalLight(0xe2e8f0, 1.0);
    ceilingLight.position.set(0, 10, 4);
    ceilingLight.castShadow = true;
    ceilingLight.shadow.mapSize.width = 1024;
    ceilingLight.shadow.mapSize.height = 1024;
    scene.add(ceilingLight);

    const blueBacklight = new THREE.DirectionalLight(0x0ea5e9, 0.6);
    blueBacklight.position.set(-6, 5, -6);
    scene.add(blueBacklight);

    // 5. 3D Room Environment (Floor, Walls, Table)
    // Floor
    const floorGeom = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid lines
    const grid = new THREE.GridHelper(30, 30, 0x0284c7, 0x1e293b);
    grid.position.y = -2.19;
    scene.add(grid);

    // Back wall
    const wallGeom = new THREE.PlaneGeometry(30, 15);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.set(0, 5, -10);
    wall.receiveShadow = true;
    scene.add(wall);

    // 6. Workbench / Laboratory Table
    const tableTopGeom = new THREE.BoxGeometry(8.5, 0.4, 6.2);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.3
    });
    const tableTop = new THREE.Mesh(tableTopGeom, tableTopMat);
    tableTop.position.set(0, 0, 0);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    scene.add(tableTop);

    // Table Edge Metal Bevel
    const bevelGeom = new THREE.BoxGeometry(8.6, 0.1, 6.3);
    const bevelMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    const bevel = new THREE.Mesh(bevelGeom, bevelMat);
    bevel.position.set(0, 0.15, 0);
    scene.add(bevel);

    // Table legs
    const legGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const legPositions = [
      [-3.8, -1.1, -2.6],
      [3.8, -1.1, -2.6],
      [-3.8, -1.1, 2.6],
      [3.8, -1.1, 2.6]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      scene.add(leg);
    });

    // ----------------------------------------------------
    // COMPONENT 1: DC Power Supply / Battery Unit (Left)
    // ----------------------------------------------------
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(-2.8, 0.6, -0.6);

    // Battery chassis
    const batteryGeom = new THREE.BoxGeometry(1.6, 1.2, 2.2);
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
    const batteryMesh = new THREE.Mesh(batteryGeom, batteryMat);
    batteryMesh.castShadow = true;
    batteryMesh.receiveShadow = true;
    batteryGroup.add(batteryMesh);

    // Voltage display panel on battery
    const displayGeom = new THREE.PlaneGeometry(0.8, 0.4);
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const display = new THREE.Mesh(displayGeom, displayMat);
    display.position.set(0, 0.2, 1.11);
    batteryGroup.add(display);

    // Positive terminal (Red)
    const redTermGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
    const redTermMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const redTerm = new THREE.Mesh(redTermGeom, redTermMat);
    redTerm.position.set(0.4, 0.65, 0.6);
    batteryGroup.add(redTerm);

    // Negative terminal (Black)
    const blackTermGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
    const blackTermMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
    const blackTerm = new THREE.Mesh(blackTermGeom, blackTermMat);
    blackTerm.position.set(-0.4, 0.65, 0.6);
    batteryGroup.add(blackTerm);

    scene.add(batteryGroup);

    // ----------------------------------------------------
    // COMPONENT 2: Knife Switch (Center-Front)
    // ----------------------------------------------------
    const switchGroup = new THREE.Group();
    switchGroup.position.set(0, 0.3, 1.5);

    // Switch wooden/plastic insulated base
    const baseGeom = new THREE.BoxGeometry(1.6, 0.15, 1.2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const switchBase = new THREE.Mesh(baseGeom, baseMat);
    switchBase.castShadow = true;
    switchGroup.add(switchBase);

    // Copper contacts
    const contactGeom = new THREE.BoxGeometry(0.15, 0.25, 0.15);
    const contactMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const contact1 = new THREE.Mesh(contactGeom, contactMat);
    contact1.position.set(-0.5, 0.18, 0);
    const contact2 = new THREE.Mesh(contactGeom, contactMat);
    contact2.position.set(0.5, 0.18, 0);
    switchGroup.add(contact1, contact2);

    // Hinged Knife Blade
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(-0.5, 0.2, 0);

    const copperBladeGeom = new THREE.BoxGeometry(1.05, 0.1, 0.05);
    const copperBlade = new THREE.Mesh(copperBladeGeom, contactMat);
    copperBlade.position.set(0.5, 0.05, 0);
    bladeGroup.add(copperBlade);

    // Insulated handle
    const handleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(1.0, 0.15, 0);
    bladeGroup.add(handle);

    switchBladeRef.current = bladeGroup;
    switchGroup.add(bladeGroup);
    scene.add(switchGroup);

    // ----------------------------------------------------
    // COMPONENT 3: Incandescent Light Bulb (Right-Front)
    // ----------------------------------------------------
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(2.4, 0.3, 0.8);

    // Ceramic socket base
    const socketGeom = new THREE.CylinderGeometry(0.45, 0.5, 0.4, 24);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.5 });
    const socket = new THREE.Mesh(socketGeom, socketMat);
    socket.position.y = 0.2;
    socket.castShadow = true;
    bulbGroup.add(socket);

    // Brass screw collar
    const screwGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const screw = new THREE.Mesh(screwGeom, screwMat);
    screw.position.y = 0.45;
    bulbGroup.add(screw);

    // Glass bulb spherical envelope
    const glassGeom = new THREE.SphereGeometry(0.65, 32, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.35,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      reflectivity: 0.9
    });
    const glassBulb = new THREE.Mesh(glassGeom, glassMat);
    glassBulb.position.y = 1.05;
    bulbGroup.add(glassBulb);

    // Internal Filament (Spiral glow)
    const filamentGeom = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const filament = new THREE.Mesh(filamentGeom, filamentMat);
    filament.rotation.x = Math.PI / 2;
    filament.position.y = 1.05;
    bulbFilamentRef.current = filament;
    bulbGroup.add(filament);

    // Dynamic 3D Point Light emitted from bulb into the room!
    const bulbLight = new THREE.PointLight(0xfef08a, 0, 18, 1.2);
    bulbLight.position.set(2.4, 1.35, 0.8);
    bulbLight.castShadow = true;
    bulbLight.shadow.bias = -0.001;
    scene.add(bulbLight);
    bulbLightRef.current = bulbLight;

    scene.add(bulbGroup);

    // ----------------------------------------------------
    // COMPONENT 4: Ceramic Resistor (Right-Back)
    // ----------------------------------------------------
    const resistorGroup = new THREE.Group();
    resistorGroup.position.set(1.5, 0.35, -1.5);

    // Body
    const rBodyGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 24);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.6 });
    const rBody = new THREE.Mesh(rBodyGeom, rBodyMat);
    rBody.rotation.z = Math.PI / 2;
    resistorGroup.add(rBody);

    // Color code bands (e.g. Brown, Black, Red, Gold)
    const bandColors = [0x92400e, 0x0f172a, 0xdc2626, 0xfbbf24];
    bandColors.forEach((color, idx) => {
      const bandGeom = new THREE.CylinderGeometry(0.205, 0.205, 0.08, 24);
      const bandMat = new THREE.MeshBasicMaterial({ color });
      const band = new THREE.Mesh(bandGeom, bandMat);
      band.rotation.z = Math.PI / 2;
      band.position.x = -0.3 + idx * 0.2;
      resistorGroup.add(band);
    });

    scene.add(resistorGroup);

    // ----------------------------------------------------
    // COMPONENT 5: Analog Ammeter Gauge (Center-Back)
    // ----------------------------------------------------
    const ammeterGroup = new THREE.Group();
    ammeterGroup.position.set(-0.8, 0.6, -1.8);

    // Body casing
    const caseGeom = new THREE.BoxGeometry(1.2, 0.9, 0.8);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const meterCase = new THREE.Mesh(caseGeom, caseMat);
    meterCase.castShadow = true;
    ammeterGroup.add(meterCase);

    // White scale dial
    const dialGeom = new THREE.PlaneGeometry(0.9, 0.6);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const dial = new THREE.Mesh(dialGeom, dialMat);
    dial.position.set(0, 0.05, 0.41);
    ammeterGroup.add(dial);

    // Pointer needle
    const needleGeom = new THREE.BoxGeometry(0.04, 0.35, 0.01);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeom, needleMat);
    needle.position.set(0, -0.05, 0.42);
    meterNeedleRef.current = needle;
    ammeterGroup.add(needle);

    scene.add(ammeterGroup);

    // ----------------------------------------------------
    // 3D Connecting Copper Wires
    // ----------------------------------------------------
    const wirePoints = [
      new THREE.Vector3(-2.4, 0.65, 0),    // Battery (+)
      new THREE.Vector3(-0.5, 0.3, 1.5),    // To switch
      new THREE.Vector3(0.5, 0.3, 1.5),     // Switch exit
      new THREE.Vector3(2.4, 0.3, 0.8),     // To bulb
      new THREE.Vector3(1.5, 0.35, -1.5),   // Bulb to resistor
      new THREE.Vector3(-0.8, 0.6, -1.8),   // To ammeter
      new THREE.Vector3(-2.8, 0.65, -0.6),  // Ammeter back to battery (-)
    ];

    const wireCurve = new THREE.CatmullRomCurve3(wirePoints, true);
    const tubeGeom = new THREE.TubeGeometry(wireCurve, 80, 0.05, 12, true);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.6,
      roughness: 0.3
    });
    const wireMesh = new THREE.Mesh(tubeGeom, tubeMat);
    scene.add(wireMesh);

    // Electron Flow Particles along the wires
    const particleCount = 70;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const pt = wireCurve.getPoint(i / particleCount);
      particlePos[i * 3] = pt.x;
      particlePos[i * 3 + 1] = pt.y;
      particlePos[i * 3 + 2] = pt.z;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.12,
      transparent: true,
      opacity: 0.9
    });
    const electronParticles = new THREE.Points(particleGeom, particleMat);
    electronParticlesRef.current = electronParticles;
    scene.add(electronParticles);

    // ----------------------------------------------------
    // Animation Loop
    // ----------------------------------------------------
    let animationFrameId: number;
    let particleOffset = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 1. Blade position animation (Open vs Closed)
      if (switchBladeRef.current) {
        const targetAngle = isSwitchClosed ? 0 : -Math.PI / 4;
        switchBladeRef.current.rotation.z += (targetAngle - switchBladeRef.current.rotation.z) * 0.15;
      }

      // 2. Bulb Glow & Filament
      if (bulbLightRef.current && bulbFilamentRef.current) {
        const targetLightIntensity = (current > 0) ? (bulbBrightness * 3.5) : 0;
        bulbLightRef.current.intensity += (targetLightIntensity - bulbLightRef.current.intensity) * 0.1;

        if (current > 0) {
          (bulbFilamentRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xfbbf24);
          (bulbFilamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = bulbBrightness * 2.5;
        } else {
          (bulbFilamentRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          (bulbFilamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      }

      // 3. Ammeter Needle Deflection
      if (meterNeedleRef.current) {
        const needleAngle = Math.min(Math.PI / 3, (current / 2.5) * (Math.PI / 3));
        meterNeedleRef.current.rotation.z = -needleAngle;
      }

      // 4. Electron flow movement along wire curve
      if (electronParticlesRef.current && current > 0) {
        particleOffset += current * 0.003;
        if (particleOffset > 1) particleOffset -= 1;
        const positions = (electronParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const t = (i / particleCount + particleOffset) % 1;
          const pt = wireCurve.getPoint(t);
          positions[i * 3] = pt.x;
          positions[i * 3 + 1] = pt.y;
          positions[i * 3 + 2] = pt.z;
        }
        electronParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        electronParticlesRef.current.visible = true;
      } else if (electronParticlesRef.current) {
        electronParticlesRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------
    // Resize Listener
    // ----------------------------------------------------
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 480;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [voltage, resistance, isSwitchClosed, hasBulb, hasResistor, hasAmmeter, wireConnected, bulbBroken]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetLookAtRef.current);
  };

  // Mouse / Touch handlers for 360 Camera rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta += deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.008));
    updateCameraPosition();

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(5.5, Math.min(16, cameraAngleRef.current.radius + e.deltaY * 0.008));
    updateCameraPosition();
  };

  const resetCamera = () => {
    soundFx.playClick(600);
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 10.5 };
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#060b17] via-[#081226] to-[#040813] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)] flex flex-col justify-between select-none">
      
      {/* Top HUD Banner */}
      <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${current > 0 ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-mono text-xs text-cyan-300 font-bold tracking-wider uppercase">
            3D ELEKTR LABORATORIYASI (XONA STOLI)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
            current > 0 
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
              : 'bg-slate-900/80 text-slate-400 border-white/10'
          }`}>
            {current > 0 ? `⚡ TOK: ${current.toFixed(2)} A` : "ZANJIR OCHIQ (0 A)"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 font-bold">
            {voltage}V DC
          </span>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div 
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Controls: 360 Hint, Quick Switch Toggle & Camera Reset */}
      <div className="relative z-10 p-3.5 sm:p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sichqoncha bilan 360° xonani aylantiring • G‘ildirakcha bilan yaqinlashtiring</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Switch Trigger Button */}
          <button
            onClick={onToggleSwitch}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isSwitchClosed
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:bg-amber-400'
                : 'bg-slate-900 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isSwitchClosed ? "Kalitni ochish (O‘chirish)" : "Kalitni yopish (Yoqish)"}</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Kamerani asl holatga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.max(5.5, cameraAngleRef.current.radius - 1.2);
              updateCameraPosition();
            }}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Yaqinlashtirish"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.min(16, cameraAngleRef.current.radius + 1.2);
              updateCameraPosition();
            }}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Uzoqlashtirish"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
