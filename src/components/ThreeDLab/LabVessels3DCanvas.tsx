import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Flame, Sparkles, Layers, Info, Beaker, Thermometer, ShieldAlert } from 'lucide-react';

interface LabVessels3DCanvasProps {
  status: 'idle' | 'pouring' | 'reacting' | 'exploded' | 'safe_completed';
  liquidColor: string;
  liquidVolumeLevel: number; // 0 to 1
  isBurnerOn?: boolean;
  onTableItemClick?: (itemName: string) => void;
  isExplosiveOutcome?: boolean;
  reagentAName?: string;
  reagentBName?: string;
  reagentAFormula?: string;
  reagentBFormula?: string;
  reagentAColor?: string;
  reagentBColor?: string;
  reactionTitle?: string;
  reactionEquation?: string;
  reactionExplanation?: string;
  gasProduced?: string;
  temperatureChange?: string;
  hasSmoke?: boolean;
  hasBubbles?: boolean;
  hasPrecipitate?: boolean;
  temperature?: number;
}

// Helper to safely parse any CSS color (hex, rgb, rgba, named) to THREE.Color and Alpha
function parseColorToThree(input: string): { color: THREE.Color; alpha: number; hexString: string } {
  if (!input) return { color: new THREE.Color(0x38bdf8), alpha: 0.85, hexString: '#38bdf8' };
  
  if (input.startsWith('rgba') || input.startsWith('rgb')) {
    const match = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1], 10) / 255;
      const g = parseInt(match[2], 10) / 255;
      const b = parseInt(match[3], 10) / 255;
      const a = match[4] !== undefined ? parseFloat(match[4]) : 0.85;
      return { 
        color: new THREE.Color(r, g, b), 
        alpha: Math.max(0.65, a),
        hexString: `rgb(${match[1]},${match[2]},${match[3]})`
      };
    }
  }

  try {
    const c = new THREE.Color(input);
    return { color: c, alpha: 0.85, hexString: input };
  } catch {
    return { color: new THREE.Color(0x38bdf8), alpha: 0.85, hexString: '#38bdf8' };
  }
}

// Generate canvas texture for realistic bottle label with dynamic chemical title
function createLabelTexture(title: string, formula: string, hazardText: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background - Clean off-white lab label paper
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 256);

  // Border & Header strip
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 244);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(10, 10, 492, 45);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LAB REAGENT // GRADE A', 256, 40);

  // Reagent Formula (Big bold black text)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 50px Arial, sans-serif';
  ctx.fillText(formula || 'H2O', 256, 115);

  // Reagent Title (Clean Uzbek name)
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 24px Arial, sans-serif';
  const cleanTitle = (title || 'Kimyoviy modda').slice(0, 28);
  ctx.fillText(cleanTitle, 256, 165);

  // Hazard warning bar
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(16, 195, 480, 42);
  ctx.fillStyle = '#854d0e';
  ctx.font = 'bold 17px "Courier New", monospace';
  ctx.fillText(`⚠ ${hazardText || 'DIQQAT: LAB REAGENTI'}`, 256, 222);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generate photorealistic graduation marks & volume ticks on Erlenmeyer flask (50ml, 100ml, 150ml, 200ml, 250ml MAX)
function createFlaskGraduationTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // High-contrast cleanroom white/cyan laser graduation lines
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 4;

  const marks = [
    { ml: '250 ml (MAX)', y: 130, w: 140, isMax: true },
    { ml: '200 ml', y: 195, w: 115, isMax: false },
    { ml: '150 ml', y: 260, w: 100, isMax: false },
    { ml: '100 ml', y: 330, w: 85, isMax: false },
    { ml: '50 ml', y: 400, w: 70, isMax: false },
  ];

  marks.forEach(m => {
    // Primary graduation mark line
    ctx.strokeStyle = m.isMax ? '#f43f5e' : 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(90, m.y);
    ctx.lineTo(90 + m.w, m.y);
    ctx.stroke();

    // Intermediate 25ml sub-tick
    if (!m.isMax) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(90, m.y - 32);
      ctx.lineTo(90 + m.w * 0.55, m.y - 32);
      ctx.stroke();
    }

    // Measurement text
    ctx.font = m.isMax ? 'bold 22px "Courier New", monospace' : 'bold 18px "Courier New", monospace';
    ctx.fillStyle = m.isMax ? '#fb7185' : '#e0f2fe';
    ctx.textAlign = 'left';
    ctx.fillText(m.ml, 105 + m.w, m.y + 6);
  });

  // Stamp: Borosilicate 3.3 laboratory certified
  ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText('ERLENMEYER 250ml', 90, 460);
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('BOROSILICATE 3.3 // ISO 1773', 90, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const LabVessels3DCanvas: React.FC<LabVessels3DCanvasProps> = ({
  status,
  liquidColor,
  liquidVolumeLevel,
  isBurnerOn = true,
  onTableItemClick,
  isExplosiveOutcome = false,
  reagentAName = 'Xlorid kislota (0.5M)',
  reagentBName = 'Natriy gidroksid (0.5M)',
  reagentAFormula = 'HCl',
  reagentBFormula = 'NaOH',
  reagentAColor = '#38bdf8',
  reagentBColor = '#818cf8',
  reactionTitle,
  reactionEquation,
  reactionExplanation,
  gasProduced,
  temperatureChange,
  hasSmoke = false,
  hasBubbles = false,
  hasPrecipitate = false,
  temperature = 22,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // References to animated 3D objects
  const flaskGroupRef = useRef<THREE.Group | null>(null);
  const mainLiquidMeshRef = useRef<THREE.Mesh | null>(null);
  const precipitateMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMeniscusRef = useRef<THREE.Mesh | null>(null);
  
  // Reagent A & B Bottles & Labels refs
  const labelAMeshRef = useRef<THREE.Mesh | null>(null);
  const labelBMeshRef = useRef<THREE.Mesh | null>(null);
  const rALiqMeshRef = useRef<THREE.Mesh | null>(null);
  const rBLiqMeshRef = useRef<THREE.Mesh | null>(null);
  const reagentABottleRef = useRef<THREE.Group | null>(null);
  const reagentBBottleRef = useRef<THREE.Group | null>(null);
  const streamParticlesRef = useRef<THREE.Points | null>(null);
  const streamGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const streamAParticlesRef = useRef<THREE.Points | null>(null);
  const streamAGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  
  // Effects
  const burnerFlameGroupRef = useRef<THREE.Group | null>(null);
  const burnerLightRef = useRef<THREE.PointLight | null>(null);
  const bubblesGroupRef = useRef<THREE.Group | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const explosionGroupRef = useRef<THREE.Group | null>(null);

  // Dynamic light for liquid glow
  const liquidInternalLightRef = useRef<THREE.PointLight | null>(null);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.1, phi: 0.38, radius: 10.2 });

  const [burnerActive, setBurnerActive] = useState(isBurnerOn);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    // 1. SCENE with atmospheric cleanroom depth
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c1a);
    scene.fog = new THREE.FogExp2(0x060c1a, 0.025);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
      camera.position.y = radius * Math.sin(phi) + 1.25;
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 1.25, 0);
    };
    updateCameraPos();

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. REALISTIC LABORATORY LIGHTING SETUP
    // Ambient light - Cool cleanroom glow
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    scene.add(ambientLight);

    // Main Overhead Directional Light (Ceiling Fluorescent Panel)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.6);
    topLight.position.set(1.5, 9, 3.5);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 1024;
    topLight.shadow.mapSize.height = 1024;
    topLight.shadow.bias = -0.001;
    scene.add(topLight);

    // Front soft fill light
    const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.7);
    fillLight.position.set(-3, 4, 5);
    scene.add(fillLight);

    // Back rim light for crisp glass refraction edges
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(3, 5, -4);
    scene.add(rimLight);

    // Bounce light from stainless table
    const tableBounceLight = new THREE.PointLight(0x0284c7, 0.7, 9);
    tableBounceLight.position.set(0, 0.4, 1.2);
    scene.add(tableBounceLight);

    // Liquid internal glow pointlight (makes chemical colors pop vibrantly)
    const parsedInitColor = parseColorToThree(liquidColor);
    const liquidLight = new THREE.PointLight(parsedInitColor.color, 1.8, 4.5);
    liquidLight.position.set(0, 1.1, 0);
    scene.add(liquidLight);
    liquidInternalLightRef.current = liquidLight;

    // 5. LABORATORY WORKBENCH (STAINLESS STEEL & CERAMIC TILES)
    const benchGroup = new THREE.Group();

    // Tabletop - Brushed Stainless Steel
    const tableGeom = new THREE.BoxGeometry(13, 0.4, 7);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.22,
      metalness: 0.78,
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.position.y = -0.2;
    tableMesh.receiveShadow = true;
    benchGroup.add(tableMesh);

    // Polished Chrome Front Bevel Trim
    const trimGeom = new THREE.BoxGeometry(13.06, 0.1, 0.1);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const trimMesh = new THREE.Mesh(trimGeom, trimMat);
    trimMesh.position.set(0, 0.02, 3.52);
    benchGroup.add(trimMesh);

    // Laser Measurement Grid
    const grid = new THREE.GridHelper(6, 12, 0x06b6d4, 0x334155);
    grid.position.set(0, 0.01, 0);
    benchGroup.add(grid);

    // Back Fume Hood Wall (Ceramic Tile Look)
    const wallGeom = new THREE.PlaneGeometry(14, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      roughness: 0.4,
      metalness: 0.2,
    });
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.set(0, 4, -3.5);
    benchGroup.add(wallMesh);

    // Caution Danger Hazard Band
    const hazardGeom = new THREE.PlaneGeometry(14, 0.35);
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hazardMesh = new THREE.Mesh(hazardGeom, hazardMat);
    hazardMesh.position.set(0, 0.25, -3.48);
    benchGroup.add(hazardMesh);

    scene.add(benchGroup);

    // 6. CRYSTAL-CLEAR BOROSILICATE GLASS MATERIAL (NEVER TURNS BLACK)
    // MeshPhongMaterial provides brilliant specular glass highlights without requiring HDR cubemaps
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.28,
      shininess: 100,
      specular: 0xffffff,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // 7. CENTRAL ERLENMEYER REACTION FLASK
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0, 0, 0);
    flaskGroupRef.current = flaskGroup;

    // Conical Body (CastShadow disabled to prevent black self-shadowing)
    const coneGeom = new THREE.CylinderGeometry(0.55, 1.48, 2.1, 36, 1, true);
    const coneMesh = new THREE.Mesh(coneGeom, glassMaterial);
    coneMesh.position.y = 1.05;
    coneMesh.castShadow = false;
    flaskGroup.add(coneMesh);

    // Cylindrical Neck
    const neckGeom = new THREE.CylinderGeometry(0.55, 0.55, 1.1, 36, 1, true);
    const neckMesh = new THREE.Mesh(neckGeom, glassMaterial);
    neckMesh.position.y = 2.55;
    neckMesh.castShadow = false;
    flaskGroup.add(neckMesh);

    // Beveled Lip Rim Ring
    const lipGeom = new THREE.TorusGeometry(0.56, 0.055, 16, 36);
    const lipMesh = new THREE.Mesh(lipGeom, glassMaterial);
    lipMesh.rotation.x = Math.PI / 2;
    lipMesh.position.y = 3.1;
    flaskGroup.add(lipMesh);

    // Flat Base
    const baseGeom = new THREE.CircleGeometry(1.48, 36);
    const baseMesh = new THREE.Mesh(baseGeom, glassMaterial);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = 0.01;
    flaskGroup.add(baseMesh);

    // PHOTOREALISTIC GRADUATION MARKS ON FLASK FRONT (50ml, 100ml, 150ml, 200ml, 250ml MAX)
    const gradTexture = createFlaskGraduationTexture();
    const gradGeom = new THREE.CylinderGeometry(0.555, 1.485, 2.1, 36, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
    const gradMat = new THREE.MeshBasicMaterial({ 
      map: gradTexture, 
      transparent: true, 
      opacity: 0.95, 
      side: THREE.DoubleSide,
      depthWrite: false 
    });
    const gradMesh = new THREE.Mesh(gradGeom, gradMat);
    gradMesh.position.y = 1.05;
    gradMesh.rotation.y = Math.PI / 5.5;
    flaskGroup.add(gradMesh);

    // MAIN CHEMICAL LIQUID INSIDE ERLENMEYER FLASK - FULLY FILLED (IDISH TO'LIB TURADI)
    // Suyuqlik idishning 90% hajmiga to'lgan (y=0.02 dan y=1.85 gacha to'la hajmda)
    const liquidGeom = new THREE.CylinderGeometry(0.64, 1.42, 1.84, 36);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: parsedInitColor.color,
      roughness: 0.12,
      metalness: 0.05,
      transparent: true,
      opacity: 0.94,
      emissive: parsedInitColor.color,
      emissiveIntensity: 0.45,
      depthWrite: true,
    });
    const liquidMesh = new THREE.Mesh(liquidGeom, liquidMat);
    liquidMesh.position.y = 0.93;
    flaskGroup.add(liquidMesh);
    mainLiquidMeshRef.current = liquidMesh;

    // Liquid Meniscus Top Surface (Suyuqlikning yuqori sirt yuzasi)
    const meniscusGeom = new THREE.CircleGeometry(0.64, 36);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: parsedInitColor.color,
      transparent: true,
      opacity: 0.96,
      roughness: 0.08,
      emissive: parsedInitColor.color,
      emissiveIntensity: 0.5,
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeom, meniscusMat);
    meniscusMesh.rotation.x = -Math.PI / 2;
    meniscusMesh.position.y = 1.85;
    flaskGroup.add(meniscusMesh);
    liquidMeniscusRef.current = meniscusMesh;

    // Chemical Precipitate Layer at bottom (e.g. for CuSO4 + NaOH)
    const precipGeom = new THREE.CylinderGeometry(1.4, 1.45, 0.16, 36);
    const precipMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.6,
      transparent: true,
      opacity: 0,
    });
    const precipMesh = new THREE.Mesh(precipGeom, precipMat);
    precipMesh.position.y = 0.08;
    flaskGroup.add(precipMesh);
    precipitateMeshRef.current = precipMesh;

    scene.add(flaskGroup);

    // 8. REAGENT 1 (A) BOTTLE ON THE LEFT SHELF WITH REALISTIC LABEL & VISIBLE LIQUID
    const reagentAGroup = new THREE.Group();
    reagentAGroup.position.set(-2.8, 0, 0.5);

    // Glass bottle cylinder
    const rAGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32);
    const rAMesh = new THREE.Mesh(rAGeom, glassMaterial);
    rAMesh.position.y = 0.9;
    reagentAGroup.add(rAMesh);

    // Liquid in Reagent A bottle (Bright, vivid, always visible)
    const parsedAColor = parseColorToThree(reagentAColor);
    const rALiqGeom = new THREE.CylinderGeometry(0.66, 0.66, 1.35, 32);
    const rALiqMat = new THREE.MeshStandardMaterial({
      color: parsedAColor.color,
      transparent: true,
      opacity: 0.92,
      roughness: 0.15,
      emissive: parsedAColor.color,
      emissiveIntensity: 0.35,
    });
    const rALiqMesh = new THREE.Mesh(rALiqGeom, rALiqMat);
    rALiqMesh.position.y = 0.68;
    reagentAGroup.add(rALiqMesh);
    rALiqMeshRef.current = rALiqMesh;

    // Bottle Neck & Cap
    const rANeckGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.4, 24);
    const rANeck = new THREE.Mesh(rANeckGeom, glassMaterial);
    rANeck.position.y = 1.95;
    reagentAGroup.add(rANeck);

    const rACapGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
    const rACapMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.3 });
    const rACap = new THREE.Mesh(rACapGeom, rACapMat);
    rACap.position.y = 2.15;
    reagentAGroup.add(rACap);

    // Dynamic Label on Bottle A
    const labelATexture = createLabelTexture(reagentAName, reagentAFormula, '1-REAGENT (A)');
    const labelAGeom = new THREE.CylinderGeometry(0.71, 0.71, 0.9, 32, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
    const labelAMat = new THREE.MeshBasicMaterial({ map: labelATexture, side: THREE.DoubleSide });
    const labelAMesh = new THREE.Mesh(labelAGeom, labelAMat);
    labelAMesh.position.y = 0.9;
    labelAMesh.rotation.y = Math.PI / 6;
    reagentAGroup.add(labelAMesh);
    labelAMeshRef.current = labelAMesh;

    scene.add(reagentAGroup);
    reagentABottleRef.current = reagentAGroup;

    // 9. REAGENT 2 (B) POURING BOTTLE / CYLINDER (Animated to pour)
    const reagentBGroup = new THREE.Group();
    reagentBGroup.position.set(2.4, 0, 0.4);
    reagentBBottleRef.current = reagentBGroup;

    // Cylindrical Beaker Body
    const rBGeom = new THREE.CylinderGeometry(0.65, 0.65, 1.7, 32);
    const rBMesh = new THREE.Mesh(rBGeom, glassMaterial);
    rBMesh.position.y = 0.85;
    reagentBGroup.add(rBMesh);

    // Liquid in Reagent B bottle (Bright, vivid, always visible)
    const parsedBColor = parseColorToThree(reagentBColor);
    const rBLiqGeom = new THREE.CylinderGeometry(0.62, 0.62, 1.25, 32);
    const rBLiqMat = new THREE.MeshStandardMaterial({
      color: parsedBColor.color,
      transparent: true,
      opacity: 0.92,
      roughness: 0.15,
      emissive: parsedBColor.color,
      emissiveIntensity: 0.35,
    });
    const rBLiqMesh = new THREE.Mesh(rBLiqGeom, rBLiqMat);
    rBLiqMesh.position.y = 0.63;
    reagentBGroup.add(rBLiqMesh);
    rBLiqMeshRef.current = rBLiqMesh;

    // Cap on Bottle B
    const rBCapGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 24);
    const rBCapMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.3 });
    const rBCap = new THREE.Mesh(rBCapGeom, rBCapMat);
    rBCap.position.y = 1.85;
    reagentBGroup.add(rBCap);

    // Dynamic Label on Bottle B
    const labelBTexture = createLabelTexture(reagentBName, reagentBFormula, '2-REAGENT (B)');
    const labelBGeom = new THREE.CylinderGeometry(0.66, 0.66, 0.85, 32, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
    const labelBMat = new THREE.MeshBasicMaterial({ map: labelBTexture, side: THREE.DoubleSide });
    const labelBMesh = new THREE.Mesh(labelBGeom, labelBMat);
    labelBMesh.position.y = 0.85;
    labelBMesh.rotation.y = -Math.PI / 6;
    reagentBGroup.add(labelBMesh);
    labelBMeshRef.current = labelBMesh;

    scene.add(reagentBGroup);

    // 10. LIQUID POURING STREAM PARTICLES (BOTTLE B & BOTTLE A)
    const streamCount = 70;
    const streamPos = new Float32Array(streamCount * 3);
    for (let i = 0; i < streamCount; i++) {
      streamPos[i * 3] = 0.65 + (Math.random() - 0.5) * 0.06;
      streamPos[i * 3 + 1] = 2.8 - Math.random() * 1.8;
      streamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }
    const streamGeom = new THREE.BufferGeometry();
    streamGeom.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    streamGeometryRef.current = streamGeom;

    const streamMat = new THREE.PointsMaterial({
      color: parsedBColor.color,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const streamPoints = new THREE.Points(streamGeom, streamMat);
    streamPoints.visible = false;
    streamParticlesRef.current = streamPoints;
    scene.add(streamPoints);

    // Stream A Particles (Reagent A pouring from left)
    const streamAPos = new Float32Array(streamCount * 3);
    for (let i = 0; i < streamCount; i++) {
      streamAPos[i * 3] = -0.65 + (Math.random() - 0.5) * 0.06;
      streamAPos[i * 3 + 1] = 2.8 - Math.random() * 1.8;
      streamAPos[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }
    const streamAGeom = new THREE.BufferGeometry();
    streamAGeom.setAttribute('position', new THREE.BufferAttribute(streamAPos, 3));
    streamAGeometryRef.current = streamAGeom;

    const streamAMat = new THREE.PointsMaterial({
      color: parsedAColor.color,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const streamAPoints = new THREE.Points(streamAGeom, streamAMat);
    streamAPoints.visible = false;
    streamAParticlesRef.current = streamAPoints;
    scene.add(streamAPoints);

    // 11. STEAM & SMOKE BILLOW PARTICLES (when heat or gas generates)
    const smokeCount = 80;
    const smokePos = new Float32Array(smokeCount * 3);
    const smokeVel: { x: number; y: number; z: number; life: number }[] = [];
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3] = (Math.random() - 0.5) * 0.3;
      smokePos[i * 3 + 1] = 2.6 + Math.random() * 0.8;
      smokePos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      smokeVel.push({
        x: (Math.random() - 0.5) * 0.015,
        y: 0.02 + Math.random() * 0.025,
        z: (Math.random() - 0.5) * 0.015,
        life: Math.random(),
      });
    }
    const smokeGeom = new THREE.BufferGeometry();
    smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.28,
      transparent: true,
      opacity: 0.45,
    });
    const smokeParticles = new THREE.Points(smokeGeom, smokeMat);
    smokeParticles.visible = false;
    smokeParticlesRef.current = smokeParticles;
    flaskGroup.add(smokeParticles);

    // 12. CHEMICAL REACTION BUBBLES GROUP (Active bubbling)
    const bubblesGroup = new THREE.Group();
    const bubbleCount = 35;
    const bubbleGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    for (let i = 0; i < bubbleCount; i++) {
      const b = new THREE.Mesh(bubbleGeom, bubbleMat);
      b.position.set(
        (Math.random() - 0.5) * 1.3,
        0.1 + Math.random() * 1.2,
        (Math.random() - 0.5) * 1.3
      );
      b.userData = { speed: 0.025 + Math.random() * 0.04, baseRadius: 0.65 };
      bubblesGroup.add(b);
    }
    bubblesGroup.visible = false;
    bubblesGroupRef.current = bubblesGroup;
    flaskGroup.add(bubblesGroup);

    // 13. REALISTIC EXPLOSION: FLASH, FIREBALL, SHATTERED FLASK BASE & FLYING GLASS SHARDS
    const explosionGroup = new THREE.Group();
    explosionGroupRef.current = explosionGroup;

    // Flash light inside blast (blinding initial white-orange blast)
    const blastFlashLight = new THREE.PointLight(0xff7700, 0, 24);
    blastFlashLight.position.set(0, 1.4, 0);
    explosionGroup.add(blastFlashLight);

    // Secondary ambient flash light for table lighting
    const blastGlowLight = new THREE.PointLight(0xff2200, 0, 14);
    blastGlowLight.position.set(0, 0.4, 0);
    explosionGroup.add(blastGlowLight);

    // Broken jagged base of the Erlenmeyer flask remaining on table
    const brokenFlaskBaseGeom = new THREE.CylinderGeometry(0.85, 1.25, 0.4, 16, 2, true);
    const brokenFlaskBaseMat = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      transmission: 0.88,
      opacity: 0.9,
      transparent: true,
      roughness: 0.25,
      ior: 1.5,
      side: THREE.DoubleSide
    });
    const brokenFlaskBase = new THREE.Mesh(brokenFlaskBaseGeom, brokenFlaskBaseMat);
    brokenFlaskBase.position.set(0, 0.22, 0);
    brokenFlaskBase.visible = false;
    explosionGroup.add(brokenFlaskBase);

    // Expanding Fireball Sphere in the center of the blast
    const fireballGeom = new THREE.SphereGeometry(0.5, 16, 16);
    const fireballMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0
    });
    const fireballMesh = new THREE.Mesh(fireballGeom, fireballMat);
    fireballMesh.position.set(0, 1.3, 0);
    fireballMesh.visible = false;
    explosionGroup.add(fireballMesh);

    // 70 Individual 3D Glass Shards (sharp triangular & faceted borosilicate glass shards)
    interface GlassShard {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      origX: number;
      origY: number;
      origZ: number;
    }
    const glassShards: GlassShard[] = [];
    const shardGeomA = new THREE.TetrahedronGeometry(0.22, 0);
    const shardGeomB = new THREE.ConeGeometry(0.16, 0.35, 3);
    const shardMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.88,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
      ior: 1.52,
      reflectivity: 0.9
    });

    for (let i = 0; i < 70; i++) {
      const geom = i % 2 === 0 ? shardGeomA : shardGeomB;
      const mesh = new THREE.Mesh(geom, shardMat);
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.1) * Math.PI * 0.55;
      const speed = 0.12 + Math.random() * 0.22;
      mesh.scale.set(
        0.4 + Math.random() * 1.5,
        0.3 + Math.random() * 1.0,
        0.2 + Math.random() * 0.8
      );
      mesh.position.set(0, 1.2, 0);
      mesh.visible = false;
      explosionGroup.add(mesh);

      glassShards.push({
        mesh,
        vx: Math.cos(angle) * Math.cos(elevation) * speed,
        vy: Math.sin(elevation) * speed + 0.08,
        vz: Math.sin(angle) * Math.cos(elevation) * speed,
        rotX: (Math.random() - 0.5) * 0.35,
        rotY: (Math.random() - 0.5) * 0.35,
        rotZ: (Math.random() - 0.5) * 0.35,
        origX: (Math.random() - 0.5) * 0.4,
        origY: 0.5 + Math.random() * 1.6,
        origZ: (Math.random() - 0.5) * 0.4,
      });
    }

    // 160 Chemical Sludge & Liquid Splashes (flying droplets out of broken flask)
    const splashCount = 160;
    const splashPos = new Float32Array(splashCount * 3);
    const splashVel: THREE.Vector3[] = [];
    for (let i = 0; i < splashCount; i++) {
      splashPos[i * 3] = 0;
      splashPos[i * 3 + 1] = 1.2;
      splashPos[i * 3 + 2] = 0;
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI * 0.55;
      const speed = 0.08 + Math.random() * 0.22;
      splashVel.push(
        new THREE.Vector3(
          Math.cos(angle) * Math.cos(elevation) * speed,
          Math.sin(elevation) * speed + 0.08,
          Math.sin(angle) * Math.cos(elevation) * speed
        )
      );
    }
    const splashGeom = new THREE.BufferGeometry();
    splashGeom.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.28,
      transparent: true,
      opacity: 0.95,
    });
    const splashPoints = new THREE.Points(splashGeom, splashMat);
    splashPoints.visible = false;
    explosionGroup.add(splashPoints);

    // Scorch Mark on the table
    const scorchGeom = new THREE.CircleGeometry(1.8, 24);
    const scorchMat = new THREE.MeshBasicMaterial({ color: 0x050508, transparent: true, opacity: 0 });
    const scorchMark = new THREE.Mesh(scorchGeom, scorchMat);
    scorchMark.rotation.x = -Math.PI / 2;
    scorchMark.position.set(0, 0.02, 0);
    explosionGroup.add(scorchMark);

    scene.add(explosionGroup);

    // 14. 3D BUNSEN BURNER ON REAR STAND
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(-1.6, 0, -1.5);

    const burnerBaseGeom = new THREE.CylinderGeometry(0.55, 0.65, 0.15, 24);
    const burnerBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const burnerBase = new THREE.Mesh(burnerBaseGeom, burnerBaseMat);
    burnerBase.position.y = 0.08;
    burnerGroup.add(burnerBase);

    const chimneyGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 24);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const chimney = new THREE.Mesh(chimneyGeom, chimneyMat);
    chimney.position.y = 0.72;
    burnerGroup.add(chimney);

    // Bunsen Flame
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 1.35, 0);
    burnerFlameGroupRef.current = flameGroup;

    const outerFlameGeom = new THREE.ConeGeometry(0.14, 0.65, 16);
    const outerFlameMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
    const outerFlame = new THREE.Mesh(outerFlameGeom, outerFlameMat);
    outerFlame.position.y = 0.32;
    flameGroup.add(outerFlame);

    const innerFlameGeom = new THREE.ConeGeometry(0.07, 0.35, 16);
    const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.95 });
    const innerFlame = new THREE.Mesh(innerFlameGeom, innerFlameMat);
    innerFlame.position.y = 0.18;
    flameGroup.add(innerFlame);

    const burnerLight = new THREE.PointLight(0x06b6d4, 1.6, 4.5);
    burnerLight.position.set(0, 1.6, 0);
    burnerGroup.add(burnerLight);
    burnerLightRef.current = burnerLight;

    burnerGroup.add(flameGroup);
    scene.add(burnerGroup);

    // 15. MAIN RENDER & ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Burner flame flicker
      if (flameGroup && burnerActive) {
        const flicker = Math.sin(elapsedTime * 18) * 0.08 + 1;
        flameGroup.scale.set(flicker, flicker * 1.1, flicker);
      }

      // Pouring animation logic - Both Reagent A & Reagent B lift and pour!
      if (reagentABottleRef.current) {
        if (status === 'pouring') {
          // Lift bottle A and tilt towards central flask
          reagentABottleRef.current.position.set(
            THREE.MathUtils.lerp(reagentABottleRef.current.position.x, -1.2, 0.08),
            THREE.MathUtils.lerp(reagentABottleRef.current.position.y, 2.5, 0.08),
            THREE.MathUtils.lerp(reagentABottleRef.current.position.z, 0.1, 0.08)
          );
          reagentABottleRef.current.rotation.z = THREE.MathUtils.lerp(
            reagentABottleRef.current.rotation.z,
            0.75, // tilts right towards central flask mouth
            0.08
          );

          if (streamAParticlesRef.current && streamAGeometryRef.current) {
            streamAParticlesRef.current.visible = true;
            const positions = streamAGeometryRef.current.attributes.position.array as Float32Array;
            for (let i = 0; i < streamCount; i++) {
              positions[i * 3 + 1] -= 0.06;
              if (positions[i * 3 + 1] < 1.0) {
                positions[i * 3 + 1] = 2.7;
              }
            }
            streamAGeometryRef.current.attributes.position.needsUpdate = true;
          }
        } else {
          // Return bottle A back to table
          reagentABottleRef.current.position.set(
            THREE.MathUtils.lerp(reagentABottleRef.current.position.x, -2.8, 0.05),
            THREE.MathUtils.lerp(reagentABottleRef.current.position.y, 0, 0.05),
            THREE.MathUtils.lerp(reagentABottleRef.current.position.z, 0.5, 0.05)
          );
          reagentABottleRef.current.rotation.z = THREE.MathUtils.lerp(
            reagentABottleRef.current.rotation.z,
            0,
            0.05
          );

          if (streamAParticlesRef.current) {
            streamAParticlesRef.current.visible = false;
          }
        }
      }

      if (reagentBBottleRef.current) {
        if (status === 'pouring') {
          // Tilt bottle B towards central flask
          reagentBBottleRef.current.position.set(
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.x, 1.1, 0.08),
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.y, 2.6, 0.08),
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.z, 0.1, 0.08)
          );
          reagentBBottleRef.current.rotation.z = THREE.MathUtils.lerp(
            reagentBBottleRef.current.rotation.z,
            -0.75,
            0.08
          );

          // Animate liquid stream particles falling into flask
          if (streamParticlesRef.current && streamGeometryRef.current) {
            streamParticlesRef.current.visible = true;
            const positions = streamGeometryRef.current.attributes.position.array as Float32Array;
            for (let i = 0; i < streamCount; i++) {
              positions[i * 3 + 1] -= 0.06;
              if (positions[i * 3 + 1] < 1.0) {
                positions[i * 3 + 1] = 2.7;
              }
            }
            streamGeometryRef.current.attributes.position.needsUpdate = true;
          }
        } else {
          // Return bottle B to table
          reagentBBottleRef.current.position.set(
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.x, 2.4, 0.05),
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.y, 0, 0.05),
            THREE.MathUtils.lerp(reagentBBottleRef.current.position.z, 0.4, 0.05)
          );
          reagentBBottleRef.current.rotation.z = THREE.MathUtils.lerp(
            reagentBBottleRef.current.rotation.z,
            0,
            0.05
          );

          if (streamParticlesRef.current) {
            streamParticlesRef.current.visible = false;
          }
        }
      }

      // Reaction swirling & chemical effervescence pulse
      if (mainLiquidMeshRef.current && status === 'reacting') {
        const pulse = 1 + Math.sin(elapsedTime * 14) * 0.035;
        mainLiquidMeshRef.current.scale.set(pulse, 1.0, pulse);
      } else if (mainLiquidMeshRef.current) {
        mainLiquidMeshRef.current.scale.set(1, 1, 1);
      }

      // Reaction bubbling animation
      if (bubblesGroupRef.current && (hasBubbles || status === 'reacting')) {
        bubblesGroupRef.current.visible = true;
        bubblesGroupRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          mesh.position.y += mesh.userData.speed || 0.02;
          if (mesh.position.y > 1.4) {
            mesh.position.y = 0.2;
            mesh.position.x = (Math.random() - 0.5) * 1.1;
            mesh.position.z = (Math.random() - 0.5) * 1.1;
          }
        });
      } else if (bubblesGroupRef.current) {
        bubblesGroupRef.current.visible = false;
      }

      // Smoke / steam animation
      if (smokeParticlesRef.current && (hasSmoke || status === 'reacting')) {
        smokeParticlesRef.current.visible = true;
        const geom = smokeParticlesRef.current.geometry;
        const pos = geom.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          const v = smokeVel[i];
          pos[i * 3] += v.x;
          pos[i * 3 + 1] += v.y;
          pos[i * 3 + 2] += v.z;
          if (pos[i * 3 + 1] > 4.5) {
            pos[i * 3] = (Math.random() - 0.5) * 0.2;
            pos[i * 3 + 1] = 2.6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          }
        }
        geom.attributes.position.needsUpdate = true;
      } else if (smokeParticlesRef.current) {
        smokeParticlesRef.current.visible = false;
      }

      // Precipitate visibility
      if (precipitateMeshRef.current) {
        const mat = precipitateMeshRef.current.material as THREE.MeshStandardMaterial;
        if (hasPrecipitate || status === 'safe_completed') {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.85, 0.05);
        } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.05);
        }
      }

      // EXPLOSION SHATTER & FLYING GLASS / SLUDGE DEBRIS SIMULATION
      if (status === 'exploded') {
        // 1. Hide original intact flask and show explosion debris
        flaskGroup.visible = false;
        explosionGroup.visible = true;
        brokenFlaskBase.visible = true;

        // 2. Flash explosion light (blinding flash decaying realistically)
        blastFlashLight.intensity = Math.max(0, blastFlashLight.intensity * 0.94);
        blastGlowLight.intensity = Math.max(0, blastGlowLight.intensity * 0.95);
        if (blastFlashLight.intensity < 0.4 && Math.random() < 0.12) {
          blastFlashLight.intensity = 5.0; // embers spark flickers
        }

        // Fireball expansion and fade
        if (fireballMesh) {
          fireballMesh.visible = true;
          fireballMesh.scale.addScalar(0.06);
          fireballMat.opacity = Math.max(0, fireballMat.opacity * 0.91);
        }

        // 3. Animate each 3D glass shard flying apart with gravity and bounce
        glassShards.forEach((shard) => {
          shard.mesh.visible = true;
          shard.mesh.position.x += shard.vx;
          shard.mesh.position.y += shard.vy;
          shard.mesh.position.z += shard.vz;

          shard.mesh.rotation.x += shard.rotX;
          shard.mesh.rotation.y += shard.rotY;
          shard.mesh.rotation.z += shard.rotZ;

          // Gravity effect
          shard.vy -= 0.005;

          // Table surface collision bounce & friction
          if (shard.mesh.position.y <= 0.05) {
            shard.mesh.position.y = 0.05;
            shard.vy = -shard.vy * 0.28; // damp bounce
            shard.vx *= 0.82; // table friction
            shard.vz *= 0.82;
            shard.rotX *= 0.75;
            shard.rotY *= 0.75;
            shard.rotZ *= 0.75;
          }
        });

        // 4. Animate splashing chemical sludge droplets
        if (splashPoints) {
          splashPoints.visible = true;
          const pos = splashGeom.attributes.position.array as Float32Array;
          for (let i = 0; i < splashCount; i++) {
            const v = splashVel[i];
            pos[i * 3] += v.x;
            pos[i * 3 + 1] += v.y;
            pos[i * 3 + 2] += v.z;
            v.y -= 0.006; // gravity
            if (pos[i * 3 + 1] <= 0.03) {
              pos[i * 3 + 1] = 0.03;
              v.x *= 0.65;
              v.z *= 0.65;
            }
          }
          splashGeom.attributes.position.needsUpdate = true;
        }

        // 5. Reveal black scorch burn mark on table
        scorchMat.opacity = THREE.MathUtils.lerp(scorchMat.opacity, 0.85, 0.09);

      } else {
        // Reset when not exploded
        flaskGroup.visible = true;
        brokenFlaskBase.visible = false;
        blastFlashLight.intensity = 32.0; // ready for next blast trigger
        blastGlowLight.intensity = 18.0;
        if (fireballMesh) {
          fireballMesh.visible = false;
          fireballMesh.scale.set(0.6, 0.6, 0.6);
          fireballMat.opacity = 0.95;
        }
        glassShards.forEach((shard) => {
          shard.mesh.visible = false;
          shard.mesh.position.set(shard.origX, shard.origY, shard.origZ);
        });
        if (splashPoints) {
          splashPoints.visible = false;
          const pos = splashGeom.attributes.position.array as Float32Array;
          for (let i = 0; i < splashCount; i++) {
            pos[i * 3] = 0;
            pos[i * 3 + 1] = 1.2;
            pos[i * 3 + 2] = 0;
          }
          splashGeom.attributes.position.needsUpdate = true;
        }
        scorchMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 16. Window & Container resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // 17. Interactive Orbit Camera Drag (Mouse + Touch)
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
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(1.2, cameraAngleRef.current.phi + deltaY * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(6.5, Math.min(16, cameraAngleRef.current.radius + e.deltaY * 0.01));
      updateCameraPos();
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    // Mobile touch controls
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
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(1.2, cameraAngleRef.current.phi + deltaY * 0.01));
      updateCameraPos();
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      resizeObserver.disconnect();
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
  }, []);

  // Update Dynamic liquid color, fill volume, and meniscus in central flask
  useEffect(() => {
    const parsed = parseColorToThree(liquidColor);

    if (mainLiquidMeshRef.current) {
      const mat = mainLiquidMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(parsed.color);
      mat.emissive.set(parsed.color);
      mat.emissiveIntensity = 0.45;
      mat.opacity = 0.94;

      // Idish to'la bo'lishi ta'minlanadi (230ml to'liq hajm)
      mainLiquidMeshRef.current.scale.set(1, 1.0, 1);
      mainLiquidMeshRef.current.position.y = 0.93;
    }

    if (liquidMeniscusRef.current) {
      const menMat = liquidMeniscusRef.current.material as THREE.MeshStandardMaterial;
      menMat.color.set(parsed.color);
      menMat.emissive.set(parsed.color);
      menMat.emissiveIntensity = 0.5;
      liquidMeniscusRef.current.position.y = 1.85;
    }

    if (liquidInternalLightRef.current) {
      liquidInternalLightRef.current.color.set(parsed.color);
      liquidInternalLightRef.current.intensity = 3.2;
    }
  }, [liquidColor, liquidVolumeLevel]);

  // Update Bottle A & Bottle B labels and liquids when selected substances change
  useEffect(() => {
    // Update Bottle A
    if (labelAMeshRef.current) {
      const texA = createLabelTexture(reagentAName || 'Reagent A', reagentAFormula || 'A', '1-REAGENT (A)');
      const mat = labelAMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map) mat.map.dispose();
      mat.map = texA;
      mat.needsUpdate = true;
    }
    if (rALiqMeshRef.current) {
      const parsedA = parseColorToThree(reagentAColor || '#38bdf8');
      const mat = rALiqMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(parsedA.color);
      mat.emissive.set(parsedA.color);
      mat.emissiveIntensity = 0.35;
      mat.opacity = 0.92;
      mat.needsUpdate = true;
    }

    // Update Bottle B
    if (labelBMeshRef.current) {
      const texB = createLabelTexture(reagentBName || 'Reagent B', reagentBFormula || 'B', '2-REAGENT (B)');
      const mat = labelBMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map) mat.map.dispose();
      mat.map = texB;
      mat.needsUpdate = true;
    }
    if (rBLiqMeshRef.current) {
      const parsedB = parseColorToThree(reagentBColor || '#818cf8');
      const mat = rBLiqMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(parsedB.color);
      mat.emissive.set(parsedB.color);
      mat.emissiveIntensity = 0.35;
      mat.opacity = 0.92;
      mat.needsUpdate = true;
    }
  }, [reagentAName, reagentAFormula, reagentAColor, reagentBName, reagentBFormula, reagentBColor]);

  // Handle Burner state
  useEffect(() => {
    setBurnerActive(isBurnerOn);
    if (burnerFlameGroupRef.current && burnerLightRef.current) {
      burnerFlameGroupRef.current.visible = isBurnerOn;
      burnerLightRef.current.intensity = isBurnerOn ? 1.6 : 0;
    }
  }, [isBurnerOn]);

  const resetCamera = () => {
    cameraAngleRef.current = { theta: 0.1, phi: 0.38, radius: 10.2 };
    if (cameraRef.current) {
      const { theta, phi, radius } = cameraAngleRef.current;
      cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
      cameraRef.current.position.y = radius * Math.sin(phi) + 1.25;
      cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
      cameraRef.current.lookAt(0, 1.25, 0);
    }
  };

  // Current liquid volume calculation in ml
  const currentVolumeMl = Math.round(Math.max(140, Math.min(240, liquidVolumeLevel * 230)));

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[580px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#060c1a] shadow-[0_0_40px_rgba(0,0,0,0.8)] flex-1 flex flex-col">
      
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Optical HUD: Reagents & Vessels In Use & Cheklar */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10 gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Main Flask Status & Capacity Checks */}
          <div className="px-3 py-1.5 rounded-xl liquid-glass border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center gap-2 pointer-events-auto backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="font-bold">ERLENMEYER 250 ML</span>
            <span className="text-slate-400 text-[10px]">| SHISHA CHEKLARI: 50–250ml</span>
          </div>

          {/* Liquid Fill Level Check Badge */}
          <div className="px-2.5 py-1.5 rounded-xl liquid-glass border border-sky-400/30 text-sky-200 text-[11px] font-mono flex items-center gap-1.5 pointer-events-auto backdrop-blur-md">
            <Beaker className="w-3.5 h-3.5 text-sky-400" />
            <span>To‘ldirilgan: <strong>{currentVolumeMl} ml</strong> / 250 ml</span>
          </div>

          {/* Temperature Check */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl liquid-glass border border-emerald-400/30 text-emerald-300 text-[11px] font-mono pointer-events-auto backdrop-blur-md">
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
            <span>T: {temperature.toFixed(1)}°C {temperatureChange ? `(${temperatureChange})` : ''}</span>
          </div>
        </div>

        {/* Camera Reset and Zoom Buttons */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={resetCamera}
            title="Kamerani boshlang‘ich holatga qaytarish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.max(6.5, cameraAngleRef.current.radius - 1.2);
              if (cameraRef.current) {
                const { theta, phi, radius } = cameraAngleRef.current;
                cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
                cameraRef.current.position.y = radius * Math.sin(phi) + 1.25;
                cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
                cameraRef.current.lookAt(0, 1.25, 0);
              }
            }}
            title="Yaqinlashtirish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              cameraAngleRef.current.radius = Math.min(16, cameraAngleRef.current.radius + 1.2);
              if (cameraRef.current) {
                const { theta, phi, radius } = cameraAngleRef.current;
                cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
                cameraRef.current.position.y = radius * Math.sin(phi) + 1.25;
                cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
                cameraRef.current.lookAt(0, 1.25, 0);
              }
            }}
            title="Uzoqlashtirish"
            className="p-1.5 sm:p-2 rounded-xl liquid-glass border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Floating Reaction Details & Checks Overlay (When Reacting or Finished) */}
      {(reactionTitle || reactionEquation || status === 'reacting' || status === 'safe_completed' || status === 'exploded') && (
        <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md pointer-events-auto z-10">
          <div className="p-3 rounded-xl liquid-glass-card border border-cyan-400/40 shadow-2xl backdrop-blur-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                REAKSIYA TAHLILI VA CHEKLAR:
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                status === 'exploded' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' :
                status === 'safe_completed' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                'bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse'
              }`}>
                {status === 'exploded' ? 'PORTLASH SODIR BO‘LDI!' :
                 status === 'safe_completed' ? 'XAVFSIZ REAKSIYA' :
                 status === 'reacting' ? 'JARAYON KETMOQDA' : 'KUZATILMOQDA'}
              </span>
            </div>

            {/* Reaction Title */}
            {reactionTitle && (
              <div className="text-xs font-bold text-white leading-tight">
                {reactionTitle}
              </div>
            )}

            {/* Chemical Equation */}
            {reactionEquation && (
              <div className="font-mono text-xs font-bold text-cyan-200 bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                {reactionEquation}
              </div>
            )}

            {/* Scientific explanation */}
            {reactionExplanation && (
              <div className="text-[11px] text-slate-300 leading-snug">
                {reactionExplanation}
              </div>
            )}

            {/* Dynamic Byproducts (Gas, Temp) */}
            <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400 border-t border-white/5">
              {gasProduced && (
                <span>💨 Gaz: <strong className="text-amber-300">{gasProduced}</strong></span>
              )}
              {temperatureChange && (
                <span>🌡 Issiqlik: <strong className="text-rose-300">{temperatureChange}</strong></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Reagents & Flask Graduation Scale HUD Banner */}
      <div className="absolute bottom-3 inset-x-3 flex flex-col sm:flex-row sm:items-center justify-between pointer-events-none z-10 text-[11px] font-mono gap-2">
        {/* Reagent A and B info badges */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* Reagent A chip */}
          <div className="px-2.5 py-1.5 rounded-xl liquid-glass border border-cyan-400/40 text-cyan-200 flex items-center gap-1.5 shadow-md">
            <span className="w-3 h-3 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: reagentAColor }} />
            <span className="font-bold">A: {reagentAFormula || 'Reagent 1'}</span>
            <span className="text-slate-300 hidden sm:inline">({reagentAName})</span>
          </div>

          <span className="text-cyan-400 font-black text-sm">+</span>

          {/* Reagent B chip */}
          <div className="px-2.5 py-1.5 rounded-xl liquid-glass border border-indigo-400/40 text-indigo-200 flex items-center gap-1.5 shadow-md">
            <span className="w-3 h-3 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: reagentBColor }} />
            <span className="font-bold">B: {reagentBFormula || 'Reagent 2'}</span>
            <span className="text-slate-300 hidden sm:inline">({reagentBName})</span>
          </div>
        </div>

        {/* Graduation quick indicators (cheklar) */}
        <div className="hidden lg:flex items-center gap-1 pointer-events-auto px-2.5 py-1 rounded-xl liquid-glass border border-white/10 text-[10px] text-slate-300">
          <span className="text-slate-400">Idish cheklari:</span>
          <span className="px-1 py-0.5 rounded bg-white/5 font-bold">50 ml</span>
          <span>→</span>
          <span className="px-1 py-0.5 rounded bg-white/5 font-bold">100 ml</span>
          <span>→</span>
          <span className="px-1 py-0.5 rounded bg-white/5 font-bold">150 ml</span>
          <span>→</span>
          <span className="px-1 py-0.5 rounded bg-white/5 font-bold">200 ml</span>
          <span>→</span>
          <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">250 ml (MAX)</span>
        </div>
      </div>

    </div>
  );
};
