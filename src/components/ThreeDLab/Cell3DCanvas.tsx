import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Eye, 
  Info,
  Layers,
  Dna
} from 'lucide-react';

interface Cell3DCanvasProps {
  cellType: 'plant-cell' | 'animal-cell';
  magnification: number;
  focusLevel: number; // 50 is optimum sharp
  lightIntensity: number;
  stainingApplied: boolean;
  activeOrganelleId: string;
  onSelectOrganelle: (id: string) => void;
}

export const Cell3DCanvas: React.FC<Cell3DCanvasProps> = ({
  cellType,
  magnification,
  focusLevel,
  lightIntensity,
  stainingApplied,
  activeOrganelleId,
  onSelectOrganelle
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredOrganelle, setHoveredOrganelle] = useState<string | null>(null);

  // Scene state refs for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cellGroupRef = useRef<THREE.Group | null>(null);
  const organelleMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const condenserLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 0.4 });
  const currentRotationRef = useRef({ x: 0.2, y: 0.4 });
  const zoomLevelRef = useRef(magnification === 1000 ? 5.5 : magnification === 400 ? 7.5 : 9.5);

  // Target camera position for organelle focus
  const targetFocusPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    zoomLevelRef.current = magnification === 1000 ? 5.2 : magnification === 400 ? 7.2 : 9.5;
  }, [magnification]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevelRef.current);
    cameraRef.current = camera;

    // 3. Renderer with high-definition anti-aliasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights: Microscope Condenser + Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const condenserLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
    condenserLight.position.set(3, 4, 6);
    scene.add(condenserLight);
    condenserLightRef.current = condenserLight;

    const subLight = new THREE.DirectionalLight(0x22c55e, 1.0);
    subLight.position.set(-4, -3, 3);
    scene.add(subLight);

    // 5. Build 3D Cell Hierarchy
    const cellGroup = new THREE.Group();
    scene.add(cellGroup);
    cellGroupRef.current = cellGroup;

    organelleMeshesRef.current.clear();

    const isPlant = cellType === 'plant-cell';

    // ----------------------------------------------------
    // A. Outer Cell Membrane / Wall
    // ----------------------------------------------------
    if (isPlant) {
      // Plant Cell: Thick hexagonal / prism-like rigid cell wall
      const wallGeom = new THREE.BoxGeometry(4.4, 4.4, 3.4, 4, 4, 4);
      const wallMat = new THREE.MeshPhysicalMaterial({
        color: stainingApplied ? 0x0d9488 : 0x15803d,
        roughness: 0.3,
        transmission: 0.65,
        thickness: 0.8,
        transparent: true,
        opacity: 0.45,
        wireframe: false
      });
      const cellWallMesh = new THREE.Mesh(wallGeom, wallMat);
      cellWallMesh.name = 'cellwall';
      cellGroup.add(cellWallMesh);
      organelleMeshesRef.current.set('cellwall', cellWallMesh);

      // Wireframe border cage for plant rigidity
      const wireGeom = new THREE.WireframeGeometry(wallGeom);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.5 });
      const wireLines = new THREE.LineSegments(wireGeom, wireMat);
      cellWallMesh.add(wireLines);
    } else {
      // Human / Animal Cell: Soft spherical membrane with subtle ripple
      const membraneGeom = new THREE.SphereGeometry(2.8, 48, 48);
      const membraneMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.2,
        transmission: 0.75,
        thickness: 0.5,
        transparent: true,
        opacity: 0.4,
        reflectivity: 0.9
      });
      const membraneMesh = new THREE.Mesh(membraneGeom, membraneMat);
      membraneMesh.name = 'membrane';
      cellGroup.add(membraneMesh);
      organelleMeshesRef.current.set('membrane', membraneMesh);
    }

    // ----------------------------------------------------
    // B. Cytoplasm inner volumetric fluid
    // ----------------------------------------------------
    const cytoGeom = new THREE.SphereGeometry(isPlant ? 2.5 : 2.6, 32, 32);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: stainingApplied ? (isPlant ? 0x2e1065 : 0x1e1b4b) : 0x064e3b,
      transparent: true,
      opacity: 0.3,
      roughness: 0.6
    });
    const cytoMesh = new THREE.Mesh(cytoGeom, cytoMat);
    cellGroup.add(cytoMesh);

    // ----------------------------------------------------
    // C. Nucleus (Yadro) & Nucleolus (Yadrocha)
    // ----------------------------------------------------
    const nucleusGroup = new THREE.Group();
    nucleusGroup.position.set(-0.4, 0.3, 0.2);
    nucleusGroup.name = 'nucleus';

    // Nucleus outer sphere
    const nucleusGeom = new THREE.SphereGeometry(1.05, 32, 32);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: stainingApplied ? 0x8b5cf6 : 0x6366f1,
      roughness: 0.4,
      transmission: 0.4,
      transparent: true,
      opacity: 0.85,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.3
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
    nucleusGroup.add(nucleusMesh);

    // Nucleolus (Dense shining center core)
    const nucleolusGeom = new THREE.SphereGeometry(0.42, 24, 24);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const nucleolusMesh = new THREE.Mesh(nucleolusGeom, nucleolusMat);
    nucleolusMesh.position.set(0.1, 0.1, 0.1);
    nucleusGroup.add(nucleolusMesh);

    // Nuclear pores (micro bumps)
    const poresGeom = new THREE.DodecahedronGeometry(1.08, 1);
    const poresMat = new THREE.PointsMaterial({ color: 0xc084fc, size: 0.06 });
    const poresMesh = new THREE.Points(poresGeom, poresMat);
    nucleusGroup.add(poresMesh);

    cellGroup.add(nucleusGroup);
    organelleMeshesRef.current.set('nucleus', nucleusGroup);

    // ----------------------------------------------------
    // D. Endoplasmic Reticulum (ER - labirint qatlamlari)
    // ----------------------------------------------------
    const erGroup = new THREE.Group();
    erGroup.name = 'er';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const torusGeom = new THREE.TorusGeometry(1.2 + i * 0.18, 0.08, 12, 32, Math.PI * 0.9);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        roughness: 0.5,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.2
      });
      const foldMesh = new THREE.Mesh(torusGeom, torusMat);
      foldMesh.position.set(-0.4, 0.3, 0.2);
      foldMesh.rotation.set(0.2 * i, angle, 0.3);
      erGroup.add(foldMesh);
    }
    cellGroup.add(erGroup);
    organelleMeshesRef.current.set('er', erGroup);

    // ----------------------------------------------------
    // E. Mitochondria (Mitoxondriyalar - Energiya stansiyalari)
    // ----------------------------------------------------
    const mitoCoords = [
      { pos: [1.2, -1.0, 0.6], rot: [0.3, 0.8, 0.2] },
      { pos: [1.4, 0.9, -0.7], rot: [-0.5, 0.4, 1.2] },
      { pos: [-1.4, -1.1, -0.4], rot: [0.6, -0.7, 0.4] },
    ];
    const mitoGroup = new THREE.Group();
    mitoGroup.name = 'mitochondria';

    mitoCoords.forEach(({ pos, rot }) => {
      const singleMito = new THREE.Group();
      singleMito.position.set(pos[0], pos[1], pos[2]);
      singleMito.rotation.set(rot[0], rot[1], rot[2]);

      // Outer capsule
      const capGeom = new THREE.CapsuleGeometry(0.24, 0.65, 16, 24);
      const capMat = new THREE.MeshPhysicalMaterial({
        color: 0xf97316,
        roughness: 0.3,
        transmission: 0.5,
        transparent: true,
        opacity: 0.9,
        emissive: 0xea580c,
        emissiveIntensity: 0.4
      });
      const capMesh = new THREE.Mesh(capGeom, capMat);
      singleMito.add(capMesh);

      // Inner cristae fold zigzag
      for (let j = -2; j <= 2; j++) {
        const discGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
        const discMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
        const disc = new THREE.Mesh(discGeom, discMat);
        disc.position.y = j * 0.12;
        singleMito.add(disc);
      }

      mitoGroup.add(singleMito);
    });
    cellGroup.add(mitoGroup);
    organelleMeshesRef.current.set('mitochondria', mitoGroup);

    // ----------------------------------------------------
    // F. Golgi Apparatus (Golji kompleksi)
    // ----------------------------------------------------
    const golgiGroup = new THREE.Group();
    golgiGroup.position.set(0.9, 1.1, 0.5);
    golgiGroup.name = 'golgi';
    for (let k = 0; k < 5; k++) {
      const gGeom = new THREE.TorusGeometry(0.45 + k * 0.08, 0.05, 12, 24, Math.PI * 0.7);
      const gMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xbe185d,
        emissiveIntensity: 0.3
      });
      const gMesh = new THREE.Mesh(gGeom, gMat);
      gMesh.position.set(0, k * 0.08, 0);
      gMesh.rotation.set(0.3, 0.2, 0.1);
      golgiGroup.add(gMesh);
    }
    // Small secretory vesicles
    for (let v = 0; v < 6; v++) {
      const vGeom = new THREE.SphereGeometry(0.06, 12, 12);
      const vMat = new THREE.MeshStandardMaterial({ color: 0xf472b6 });
      const vMesh = new THREE.Mesh(vGeom, vMat);
      vMesh.position.set((Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
      golgiGroup.add(vMesh);
    }
    cellGroup.add(golgiGroup);
    organelleMeshesRef.current.set('golgi', golgiGroup);

    // ----------------------------------------------------
    // G. Plant Specific: Chloroplasts & Central Vacuole
    // ----------------------------------------------------
    if (isPlant) {
      // 1. Large Central Vacuole
      const vacGeom = new THREE.SphereGeometry(1.4, 32, 32);
      const vacMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        transmission: 0.85,
        thickness: 0.4,
        transparent: true,
        opacity: 0.55,
        reflectivity: 0.95
      });
      const vacuoleMesh = new THREE.Mesh(vacGeom, vacMat);
      vacuoleMesh.position.set(0.8, -0.6, -0.3);
      vacuoleMesh.scale.set(1.2, 0.9, 1.1);
      vacuoleMesh.name = 'vacuole';
      cellGroup.add(vacuoleMesh);
      organelleMeshesRef.current.set('vacuole', vacuoleMesh);

      // 2. Chloroplasts (Xloroplastlar)
      const chloroGroup = new THREE.Group();
      chloroGroup.name = 'chloroplast';
      const chloroCoords = [
        [-1.3, 1.2, -0.8],
        [1.3, -1.3, 0.9],
        [-1.2, -0.7, 1.1],
        [0.2, 1.5, -0.6]
      ];
      chloroCoords.forEach(([cx, cy, cz]) => {
        const cMeshGroup = new THREE.Group();
        cMeshGroup.position.set(cx, cy, cz);

        // Chloroplast disc-like oval
        const ovalGeom = new THREE.SphereGeometry(0.35, 20, 20);
        const ovalMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x15803d,
          emissiveIntensity: 0.35,
          roughness: 0.3
        });
        const oval = new THREE.Mesh(ovalGeom, ovalMat);
        oval.scale.set(1.3, 0.7, 1.0);
        cMeshGroup.add(oval);

        // Internal grana discs
        for (let g = 0; g < 3; g++) {
          const granaGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12);
          const granaMat = new THREE.MeshBasicMaterial({ color: 0x86efac });
          const grana = new THREE.Mesh(granaGeom, granaMat);
          grana.position.set((g - 1) * 0.18, 0, 0);
          cMeshGroup.add(grana);
        }

        chloroGroup.add(cMeshGroup);
      });
      cellGroup.add(chloroGroup);
      organelleMeshesRef.current.set('chloroplast', chloroGroup);
    }

    // ----------------------------------------------------
    // H. Ribosomes floating particles
    // ----------------------------------------------------
    const riboCount = 120;
    const riboGeom = new THREE.BufferGeometry();
    const riboPositions = new Float32Array(riboCount * 3);
    for (let i = 0; i < riboCount * 3; i += 3) {
      const r = 1.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      riboPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      riboPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      riboPositions[i + 2] = r * Math.cos(phi);
    }
    riboGeom.setAttribute('position', new THREE.BufferAttribute(riboPositions, 3));
    const riboMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.85
    });
    const riboPoints = new THREE.Points(riboGeom, riboMat);
    cellGroup.add(riboPoints);

    // ----------------------------------------------------
    // Animation Loop
    // ----------------------------------------------------
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (cellGroupRef.current) {
        cellGroupRef.current.rotation.x = currentRotationRef.current.x;
        cellGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Smooth camera zoom
      if (cameraRef.current) {
        cameraRef.current.position.z += (zoomLevelRef.current - cameraRef.current.position.z) * 0.08;
      }

      // Gentle internal cellular pulse
      const time = Date.now() * 0.0015;
      if (nucleusGroup) {
        nucleusGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
      }
      if (mitoGroup) {
        mitoGroup.rotation.z = Math.cos(time * 0.4) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------
    // Resize Listener
    // ----------------------------------------------------
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
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
  }, [cellType, stainingApplied]);

  // Update lighting & focus dynamically
  useEffect(() => {
    if (condenserLightRef.current) {
      condenserLightRef.current.intensity = (lightIntensity / 80) * 2.5;
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = (lightIntensity / 100) * 0.8;
    }
  }, [lightIntensity]);

  // Highlight active organelle
  useEffect(() => {
    organelleMeshesRef.current.forEach((mesh, id) => {
      if (id === activeOrganelleId) {
        mesh.scale.set(1.08, 1.08, 1.08);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    });
  }, [activeOrganelleId]);

  // Mouse / Touch handlers for 360 rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.005;
    zoomLevelRef.current = Math.min(12, Math.max(4.0, zoomLevelRef.current + zoomDelta));
  };

  // Blur simulation based on focus
  const blurFactor = Math.abs(focusLevel - 50) * 0.16;

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#030712] via-[#050b1a] to-[#030611] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col justify-between select-none">
      
      {/* Top HUD Controls Bar */}
      <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <span className="font-mono text-xs text-cyan-300 font-bold tracking-wider uppercase">
            3D Biologik Hujayra (360° Interaktiv)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 font-bold">
            {cellType === 'plant-cell' ? "🌿 O‘simlik hujayrasi" : "🧬 Odam/Hayvon hujayrasi"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono text-amber-300 font-bold">
            {magnification}x
          </span>
        </div>
      </div>

      {/* Center 3D Canvas Mount Point */}
      <div 
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full flex-1 cursor-grab active:cursor-grabbing transition-all duration-300"
        style={{
          filter: `blur(${blurFactor}px)`
        }}
      />

      {/* Optical Reticle Overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 rounded-full border border-cyan-400/15" />
        <div className="absolute w-80 h-80 rounded-full border border-teal-400/10" />
      </div>

      {/* Bottom Floating Interactive Shortcuts */}
      <div className="relative z-10 p-3.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sichqoncha bilan aylantiring • G‘ildirakcha bilan yaqinlashtiring</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              targetRotationRef.current = { x: 0.2, y: 0.4 };
              zoomLevelRef.current = 7.2;
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            title="Kamerani asl holatga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[10px]">Asl ko‘rinish</span>
          </button>
          
          <button
            onClick={() => {
              zoomLevelRef.current = Math.max(4.0, zoomLevelRef.current - 1.0);
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Yaqinlashtirish"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              zoomLevelRef.current = Math.min(11.0, zoomLevelRef.current + 1.0);
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Uzoqlashtirish"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
