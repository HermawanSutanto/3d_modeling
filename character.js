/* ==========================================================================
   STYLIZED 3D GAME CHARACTER — MASTER MODEL V1
   Animal Crossing Villager Style Character Generator
   Strict adherence to spec.md: Boy with red shirt (#1), blue shorts, blue shoes
   ========================================================================== */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('three'));
  } else {
    root.CharacterModel = factory(root.THREE);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  // --- COLOR PALETTE (Strictly from spec.md & Reference Image) ---
  const PALETTE = {
    skin: 0xfcd4b8,         // Warm light peach skin
    skinShadow: 0xe6a885,   // Slightly deeper tone for inner ears/contours
    nose: 0xf28f77,         // Warmer peach/coral tint for cute nose
    hair: 0x1e0f08,         // Deep dark chocolate brown
    shirt: 0xc91815,        // Saturated clean medium-bright red
    shirtCollar: 0xa81210,  // Deep red collar ribbing
    badgeCyan: '#00bfe6',   // Saturated Cyan / Sky-blue badge background
    badgeWhite: '#ffffff',  // Crisp white number "1"
    badgeBorder: '#008fb0', // Badge border outline
    shorts: 0x161e2b,       // Medium-to-dark navy blue
    shoes: 0x1458b8,        // Clean blue sneaker canvas
    sole: 0xf8f9fa,         // Crisp white rubber sole
    sock: 0xffffff,         // White socks
    eyes: 0x111111,         // Near-black dark eyes
    eyeHighlight: 0xffffff, // White reflection catchlight
    mouth: 0x3a1815,        // Soft dark brown smile
    cheeks: 0xf87171,       // Soft gentle pink blush
    platform: 0xe2e8f0,     // Studio pedestal top
    platformRim: 0xcbd5e1   // Studio pedestal rim
  };

  // --- MATERIAL FACTORY ---
  function createMaterials() {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: PALETTE.skin,
        roughness: 0.65,
        metalness: 0.02
      }),
      innerEar: new THREE.MeshStandardMaterial({
        color: PALETTE.skinShadow,
        roughness: 0.7,
        metalness: 0.02
      }),
      nose: new THREE.MeshStandardMaterial({
        color: PALETTE.nose,
        roughness: 0.6,
        metalness: 0.02
      }),
      hair: new THREE.MeshStandardMaterial({
        color: PALETTE.hair,
        roughness: 0.75,
        metalness: 0.04
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: PALETTE.shirt,
        roughness: 0.6,
        metalness: 0.02
      }),
      shirtCollar: new THREE.MeshStandardMaterial({
        color: PALETTE.shirtCollar,
        roughness: 0.65,
        metalness: 0.02
      }),
      shorts: new THREE.MeshStandardMaterial({
        color: PALETTE.shorts,
        roughness: 0.75,
        metalness: 0.02
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: PALETTE.shoes,
        roughness: 0.55,
        metalness: 0.04
      }),
      sole: new THREE.MeshStandardMaterial({
        color: PALETTE.sole,
        roughness: 0.35,
        metalness: 0.02
      }),
      sock: new THREE.MeshStandardMaterial({
        color: PALETTE.sock,
        roughness: 0.7,
        metalness: 0.02
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: PALETTE.eyes,
        roughness: 0.25,
        metalness: 0.05
      }),
      eyeHighlight: new THREE.MeshBasicMaterial({
        color: PALETTE.eyeHighlight
      }),
      mouth: new THREE.MeshBasicMaterial({
        color: PALETTE.mouth
      }),
      cheeks: new THREE.MeshBasicMaterial({
        color: PALETTE.cheeks,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      })
    };
  }

  // --- DYNAMIC PROCEDURAL SHIRT BADGE TEXTURE ---
  function drawBadgeToCanvas(canvas, options = {}) {
    const size = canvas.width;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const text = options.text !== undefined ? String(options.text) : '1';
    const shape = options.shape || 'rounded-rect';
    const bgColor = options.bgColor || PALETTE.badgeCyan;
    const textColor = options.textColor || PALETTE.badgeWhite;
    const borderColor = options.borderColor || PALETTE.badgeBorder;

    if (shape === 'none') {
      return;
    }

    const badgeW = 680;
    const badgeH = 780;
    const badgeX = (size - badgeW) / 2;
    const badgeY = (size - badgeH) / 2 + 20;
    const radius = 160;

    if (shape === 'circle') {
      ctx.fillStyle = borderColor;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 10, 360, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 + 10, 340, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Rounded rectangle
      ctx.fillStyle = borderColor;
      roundRect(ctx, badgeX - 12, badgeY - 12, badgeW + 24, badgeH + 24, radius + 10);
      ctx.fill();

      ctx.fillStyle = bgColor;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, radius);
      ctx.fill();

      ctx.lineWidth = 14;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      roundRect(ctx, badgeX + 16, badgeY + 16, badgeW - 32, badgeH - 32, radius - 10);
      ctx.stroke();
    }

    // Render text / emblem
    ctx.fillStyle = textColor;
    if (text === '1' && shape !== 'circle') {
      // Classic Athletic Number 1
      ctx.beginPath();
      const cx = size / 2;
      const topY = badgeY + 130;
      const stemW = 120;
      const stemH = 460;
      const baseW = 320;
      const baseH = 80;

      ctx.moveTo(cx + stemW / 2, topY);
      ctx.lineTo(cx - stemW / 2, topY);
      ctx.lineTo(cx - stemW / 2 - 130, topY + 110);
      ctx.lineTo(cx - stemW / 2 - 60, topY + 175);
      ctx.lineTo(cx - stemW / 2, topY + 125);
      ctx.lineTo(cx - stemW / 2, topY + stemH - baseH);
      ctx.lineTo(cx - baseW / 2, topY + stemH - baseH);
      ctx.lineTo(cx - baseW / 2, topY + stemH);
      ctx.lineTo(cx + baseW / 2, topY + stemH);
      ctx.lineTo(cx + baseW / 2, topY + stemH - baseH);
      ctx.lineTo(cx + stemW / 2, topY + stemH - baseH);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = text.length > 2 ? 300 : text.length > 1 ? 400 : 500;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(text, size / 2, size / 2 + 30);
    }

    function roundRect(context, x, y, w, h, r) {
      context.beginPath();
      context.moveTo(x + r, y);
      context.arcTo(x + w, y, x + w, y + h, r);
      context.arcTo(x + w, y + h, x, y + h, r);
      context.arcTo(x, y + h, x, y, r);
      context.arcTo(x, y, x + w, y, r);
      context.closePath();
    }
  }

  function createBadgeTexture(options = {}) {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let currentOptions = Object.assign({}, options);
    drawBadgeToCanvas(canvas, currentOptions);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    texture.updateBadge = (newOptions) => {
      Object.assign(currentOptions, newOptions);
      drawBadgeToCanvas(canvas, currentOptions);
      texture.needsUpdate = true;
    };
    return texture;
  }

  // --- PROCEDURAL CHARACTER BUILDER ---
  function buildCharacter() {
    const materials = createMaterials();
    const character = new THREE.Group();
    character.name = 'VillagerCharacter';
    const v = new THREE.Vector3();

    // Rigs & Animation Nodes Container
    const rig = {
      root: character,
      body: new THREE.Group(),
      head: new THREE.Group(),
      leftArm: new THREE.Group(),
      rightArm: new THREE.Group(),
      leftElbow: new THREE.Group(),
      rightElbow: new THREE.Group(),
      leftLeg: new THREE.Group(),
      rightLeg: new THREE.Group(),
      leftKnee: new THREE.Group(),
      rightKnee: new THREE.Group(),
      leftEye: null,
      rightEye: null,
      materials: materials
    };

    character.add(rig.body);

    // ==========================================
    // PART REGISTRY & 3D SELECTION ENGINE
    // ==========================================
    const registeredParts = new Map();
    let nextCustomId = 1;

    function registerPart(mesh, info = {}) {
      if (!mesh) return mesh;
      const partId = info.id || `custom_part_${nextCustomId++}`;
      mesh.name = info.name || mesh.name || partId;
      mesh.userData.partId = partId;
      mesh.userData.partName = mesh.name;
      mesh.userData.category = info.category || 'misc';
      mesh.userData.boneId = info.boneId || info.category || 'torso';
      mesh.userData.facialRole = info.facialRole || 'none';
      mesh.userData.geomType = info.geomType || (mesh.geometry ? mesh.geometry.type : 'Mesh');
      mesh.userData.isCustom = !!info.isCustom;
      if (!mesh.userData.defaultTransform) {
        mesh.userData.defaultTransform = {
          position: mesh.position.clone(),
          rotation: mesh.rotation.clone(),
          scale: mesh.scale.clone()
        };
      }
      registeredParts.set(partId, mesh);
      return mesh;
    }

    const selectionBox = new THREE.BoxHelper(character, 0x0284c7);
    selectionBox.visible = false;
    character.add(selectionBox);

    // ==========================================
    // 1 & 2. HEAD & EARS (Referenced & Loaded from scene.gltf)
    // ==========================================
    const headGroup = rig.head;
    headGroup.position.set(0, 6.85, 0);
    rig.body.add(headGroup);

    // Container for imported scene.gltf head
    const gltfHeadContainer = new THREE.Group();
    gltfHeadContainer.name = 'GLTF_Head_Container';
    headGroup.add(gltfHeadContainer);

    // Initial shape matching scene.gltf (scale: 1.65)
    const scale = 1.65;
    const baseCapsuleGeo = new THREE.SphereGeometry(1.0, 36, 28);
    // Exact scene.gltf Capsule aspect: X=1.06, Y=0.58*1.5=0.87, Z=0.88
    baseCapsuleGeo.scale(1.06 * scale, 0.87 * scale, 0.88 * scale);
    const baseHeadMesh = new THREE.Mesh(baseCapsuleGeo, materials.skin);
    baseHeadMesh.castShadow = true;
    baseHeadMesh.receiveShadow = true;
    baseHeadMesh.name = 'Base_Capsule_Head';
    registerPart(baseHeadMesh, {
      id: 'head_capsule',
      name: 'Kepala Kapsul (scene.gltf)',
      category: 'head',
      geomType: 'capsule'
    });
    gltfHeadContainer.add(baseHeadMesh);

    // Initial ears matching scene.gltf Cylinders
    function createEarFromGLTFRef(side) {
      const earGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32);
      earGeo.rotateX(Math.PI * 0.5);
      earGeo.scale(0.24 * scale, 0.28 * scale, 0.14 * scale);
      const earMesh = new THREE.Mesh(earGeo, materials.skin);
      earMesh.position.set(side * 1.05 * scale, -0.086 * scale, 0.0);
      earMesh.castShadow = true;
      earMesh.receiveShadow = true;
      return earMesh;
    }
    const baseLeftEar = createEarFromGLTFRef(-1);
    const baseRightEar = createEarFromGLTFRef(1);
    baseLeftEar.userData.baseScale = baseLeftEar.scale.clone();
    baseRightEar.userData.baseScale = baseRightEar.scale.clone();
    registerPart(baseLeftEar, {
      id: 'ear_left',
      name: 'Telinga Kiri',
      category: 'ears',
      geomType: 'cylinder'
    });
    registerPart(baseRightEar, {
      id: 'ear_right',
      name: 'Telinga Kanan',
      category: 'ears',
      geomType: 'cylinder'
    });
    gltfHeadContainer.add(baseLeftEar);
    gltfHeadContainer.add(baseRightEar);

    // Asynchronously or synchronously replace with direct scene.gltf nodes when GLTFLoader is ready
    if (typeof THREE.GLTFLoader === 'function') {
      const loader = new THREE.GLTFLoader();

      const applyGLTFScene = (loadedScene) => {
        // Clear procedural placeholder
        while (gltfHeadContainer.children.length > 0) {
          gltfHeadContainer.remove(gltfHeadContainer.children[0]);
        }

        loadedScene.name = 'GLTF_Imported_Head';
        loadedScene.scale.set(scale, scale, scale);
        // Center capsule at (0, 0, 0)
        loadedScene.position.set(0, -2.2045489664527826 * scale, 0);

        loadedScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = materials.skin;
            if (!child.userData.baseScale) {
              child.userData.baseScale = child.scale.clone();
            }
            if (child.name.toLowerCase().includes('cylinder_1')) {
              registerPart(child, {
                id: 'ear_right',
                name: 'Telinga Kanan (scene.gltf)',
                category: 'ears',
                geomType: 'cylinder'
              });
            } else if (child.name.toLowerCase().includes('cylinder')) {
              registerPart(child, {
                id: 'ear_left',
                name: 'Telinga Kiri (scene.gltf)',
                category: 'ears',
                geomType: 'cylinder'
              });
            } else {
              registerPart(child, {
                id: 'head_capsule',
                name: 'Kepala Kapsul (scene.gltf)',
                category: 'head',
                geomType: 'capsule'
              });
            }
          }
        });

        gltfHeadContainer.add(loadedScene);
        if (typeof rig !== 'undefined' && rig.updateProportions && currentConfig) {
          rig.updateProportions(currentConfig.proportions);
        }
      };

      if (typeof window !== 'undefined' && window.SCENE_GLTF_DATA) {
        loader.parse(JSON.stringify(window.SCENE_GLTF_DATA), '', (gltf) => {
          applyGLTFScene(gltf.scene);
        });
      } else {
        loader.load('scene.gltf', (gltf) => {
          applyGLTFScene(gltf.scene);
        }, undefined, (err) => {
          console.warn('Fallback to procedural scene.gltf reference:', err);
        });
      }
    }

    // ==========================================
    // 3. HAIR (Multi-Style Support: Bowl-Cut, Short, Spiky, Bald)
    // ==========================================
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    const hairStyles = {
      bowlCut: new THREE.Group(),
      shortCrop: new THREE.Group(),
      spiky: new THREE.Group()
    };
    hairGroup.add(hairStyles.bowlCut);
    hairGroup.add(hairStyles.shortCrop);
    hairGroup.add(hairStyles.spiky);

    // --- STYLE A: BOWL-CUT (Master Model V1) ---
    const hairCapGeo = new THREE.SphereGeometry(1.78, 64, 48);
    const hPos = hairCapGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      v.fromBufferAttribute(hPos, i);

      v.x *= 1.05;
      v.y *= 0.88;
      v.z *= 0.92;

      // Bowl cut: smooth front hairline framing upper forehead
      if (v.z > 0.15 && v.y < 0.28) {
        v.y += (0.28 - v.y) * 0.75;
        v.z -= 0.08;
      }
      // Back and sides drape down around skull
      if (v.z < -0.05 && v.y < -0.32) {
        v.y = Math.max(v.y, -0.65);
      }

      hPos.setXYZ(i, v.x, v.y, v.z);
    }
    hairCapGeo.computeVertexNormals();

    const hairCapMesh = new THREE.Mesh(hairCapGeo, materials.hair);
    hairCapMesh.position.set(0, 0.10, -0.02);
    hairCapMesh.castShadow = true;
    hairCapMesh.receiveShadow = true;
    registerPart(hairCapMesh, {
      id: 'hair_cap',
      name: 'Batok Rambut Utama',
      category: 'hair',
      geomType: 'sphere'
    });
    hairStyles.bowlCut.add(hairCapMesh);

    function createFringeLock(width, height, posX, posY, posZ, rotZ) {
      const lockGeo = new THREE.ConeGeometry(width, height, 24);
      lockGeo.rotateX(Math.PI);
      lockGeo.scale(1.0, 1.0, 0.14);
      const lockMesh = new THREE.Mesh(lockGeo, materials.hair);
      lockMesh.position.set(posX, posY, posZ);
      lockMesh.rotation.z = rotZ;
      lockMesh.castShadow = true;
      return lockMesh;
    }

    const lockCenter = registerPart(createFringeLock(0.48, 0.58, 0.0, 0.05, 1.48, 0.0), {
      id: 'hair_lock_center',
      name: 'Segitiga Rambut Tengah (Cone)',
      category: 'hair',
      geomType: 'cone'
    });
    const lockLeft = registerPart(createFringeLock(0.44, 0.54, -0.58, 0.08, 1.44, -0.10), {
      id: 'hair_lock_left',
      name: 'Segitiga Rambut Kiri (Cone)',
      category: 'hair',
      geomType: 'cone'
    });
    const lockRight = registerPart(createFringeLock(0.44, 0.54, 0.58, 0.08, 1.44, 0.10), {
      id: 'hair_lock_right',
      name: 'Segitiga Rambut Kanan (Cone)',
      category: 'hair',
      geomType: 'cone'
    });
    hairStyles.bowlCut.add(lockCenter);
    hairStyles.bowlCut.add(lockLeft);
    hairStyles.bowlCut.add(lockRight);

    function createSideburn(side) {
      const sbGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.90, 16);
      sbGeo.scale(0.65, 1.0, 1.0);
      const sbMesh = new THREE.Mesh(sbGeo, materials.hair);
      sbMesh.position.set(side * 1.76, -0.22, 0.18);
      sbMesh.rotation.z = -side * 0.12;
      sbMesh.castShadow = true;
      return sbMesh;
    }
    const sbLeft = registerPart(createSideburn(-1), {
      id: 'hair_sideburn_l',
      name: 'Jambang Kiri (Cylinder)',
      category: 'hair',
      geomType: 'cylinder'
    });
    const sbRight = registerPart(createSideburn(1), {
      id: 'hair_sideburn_r',
      name: 'Jambang Kanan (Cylinder)',
      category: 'hair',
      geomType: 'cylinder'
    });
    hairStyles.bowlCut.add(sbLeft);
    hairStyles.bowlCut.add(sbRight);

    // --- STYLE B: SHORT CROP ---
    const shortCap = hairCapMesh.clone();
    hairStyles.shortCrop.add(shortCap);
    // Short crop neat fringe
    const shortFringeGeo = new THREE.CylinderGeometry(0.08, 0.14, 1.6, 24);
    shortFringeGeo.rotateZ(Math.PI * 0.5);
    const shortFringe = new THREE.Mesh(shortFringeGeo, materials.hair);
    shortFringe.position.set(0, 0.32, 1.42);
    hairStyles.shortCrop.add(shortFringe);
    hairStyles.shortCrop.add(createSideburn(-1));
    hairStyles.shortCrop.add(createSideburn(1));
    hairStyles.shortCrop.visible = false;

    // --- STYLE C: SPIKY BANGS ---
    const spikyCap = hairCapMesh.clone();
    hairStyles.spiky.add(spikyCap);
    hairStyles.spiky.add(createFringeLock(0.42, 0.65, -0.35, 0.12, 1.48, -0.25));
    hairStyles.spiky.add(createFringeLock(0.45, 0.70, 0.20, 0.10, 1.50, 0.18));
    hairStyles.spiky.add(createFringeLock(0.38, 0.55, 0.65, 0.15, 1.44, 0.32));
    hairStyles.spiky.add(createFringeLock(0.38, 0.55, -0.75, 0.15, 1.44, -0.30));
    hairStyles.spiky.add(createSideburn(-1));
    hairStyles.spiky.add(createSideburn(1));
    hairStyles.spiky.visible = false;

    // ==========================================
    // 4. FACIAL FEATURES (Multi-Expression Support)
    // ==========================================
    const faceGroup = new THREE.Group();
    headGroup.add(faceGroup);

    // Left Eye
    const leftEyePivot = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.23, 32, 16);
    eyeGeo.scale(0.85, 1.35, 0.22);
    const eyeMeshL = registerPart(new THREE.Mesh(eyeGeo, materials.eyes), {
      id: 'eye_left',
      name: 'Mata Kiri',
      category: 'face',
      facialRole: 'eye_left',
      geomType: 'sphere'
    });
    leftEyePivot.add(eyeMeshL);
    const hlGeo = new THREE.SphereGeometry(0.065, 16, 16);
    hlGeo.scale(1.0, 1.1, 0.4);
    const hlMeshL = registerPart(new THREE.Mesh(hlGeo, materials.eyeHighlight), {
      id: 'eye_hl_left',
      name: 'Kilau Mata Kiri',
      category: 'face',
      geomType: 'sphere'
    });
    hlMeshL.position.set(-0.04, 0.13, 0.05);
    leftEyePivot.add(hlMeshL);
    leftEyePivot.position.set(-0.60, -0.10, 1.45);
    leftEyePivot.rotation.y = -0.12;
    leftEyePivot.rotation.x = -0.05;
    faceGroup.add(leftEyePivot);
    rig.leftEye = leftEyePivot;

    // Right Eye (Supports Normal & Wink)
    const rightEyePivot = new THREE.Group();
    const rightEyeNormal = new THREE.Group();
    const eyeMeshR = registerPart(new THREE.Mesh(eyeGeo, materials.eyes), {
      id: 'eye_right',
      name: 'Mata Kanan',
      category: 'face',
      facialRole: 'eye_right',
      geomType: 'sphere'
    });
    rightEyeNormal.add(eyeMeshR);
    const hlMeshR = registerPart(new THREE.Mesh(hlGeo, materials.eyeHighlight), {
      id: 'eye_hl_right',
      name: 'Kilau Mata Kanan',
      category: 'face',
      geomType: 'sphere'
    });
    hlMeshR.position.set(0.04, 0.13, 0.05);
    rightEyeNormal.add(hlMeshR);
    rightEyePivot.add(rightEyeNormal);

    // Wink Arc
    const winkGeo = new THREE.TorusGeometry(0.18, 0.038, 16, 24, Math.PI * 0.7);
    const winkMesh = registerPart(new THREE.Mesh(winkGeo, materials.mouth), {
      id: 'eye_wink_right',
      name: 'Kedip Mata Kanan (Torus)',
      category: 'face',
      geomType: 'torus'
    });
    winkMesh.rotation.x = 0.2;
    winkMesh.rotation.z = Math.PI * 1.15;
    winkMesh.visible = false;
    rightEyePivot.add(winkMesh);

    rightEyePivot.position.set(0.60, -0.10, 1.45);
    rightEyePivot.rotation.y = 0.12;
    rightEyePivot.rotation.x = -0.05;
    faceGroup.add(rightEyePivot);
    rig.rightEye = rightEyePivot;
    rig.rightEyeNormal = rightEyeNormal;
    rig.rightEyeWink = winkMesh;

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.13, 0.22, 16);
    noseGeo.rotateX(Math.PI * 0.42);
    noseGeo.scale(1.2, 0.85, 1.0);
    const noseMesh = registerPart(new THREE.Mesh(noseGeo, materials.nose), {
      id: 'nose_cone',
      name: 'Hidung Kerucut (Cone)',
      category: 'face',
      facialRole: 'nose',
      geomType: 'cone'
    });
    noseMesh.position.set(0, -0.24, 1.48);
    faceGroup.add(noseMesh);

    // Mouth Expressions
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'MouthGroup';
    faceGroup.add(mouthGroup);
    rig.mouthGroup = mouthGroup;

    // 1. Smile (Default)
    const mouthSmileGeo = new THREE.TorusGeometry(0.26, 0.038, 16, 32, Math.PI * 0.65);
    const mouthSmile = registerPart(new THREE.Mesh(mouthSmileGeo, materials.mouth), {
      id: 'mouth_smile',
      name: 'Mulut Senyum (Torus)',
      category: 'face',
      facialRole: 'mouth',
      geomType: 'torus'
    });
    mouthSmile.position.set(0, -0.52, 1.44);
    mouthSmile.rotation.x = 0.22;
    mouthSmile.rotation.z = Math.PI * 1.18;
    mouthGroup.add(mouthSmile);

    // 2. Laugh (Open happy smile)
    const mouthLaughGeo = new THREE.CircleGeometry(0.24, 24, 0, Math.PI);
    mouthLaughGeo.rotateZ(Math.PI);
    const mouthLaugh = registerPart(new THREE.Mesh(mouthLaughGeo, materials.mouth), {
      id: 'mouth_laugh',
      name: 'Mulut Tertawa',
      category: 'face',
      facialRole: 'mouth',
      geomType: 'circle'
    });
    mouthLaugh.position.set(0, -0.50, 1.44);
    mouthLaugh.scale.set(1.15, 0.75, 1.0);
    mouthLaugh.visible = false;
    mouthGroup.add(mouthLaugh);

    // 3. Neutral (Calm horizontal line)
    const mouthNeutralGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.32, 16);
    mouthNeutralGeo.rotateZ(Math.PI * 0.5);
    const mouthNeutral = registerPart(new THREE.Mesh(mouthNeutralGeo, materials.mouth), {
      id: 'mouth_neutral',
      name: 'Mulut Tenang (Cylinder)',
      category: 'face',
      facialRole: 'mouth',
      geomType: 'cylinder'
    });
    mouthNeutral.position.set(0, -0.52, 1.44);
    mouthNeutral.visible = false;
    mouthGroup.add(mouthNeutral);

    // 4. Surprised (:O)
    const mouthSurprisedGeo = new THREE.TorusGeometry(0.12, 0.035, 16, 24);
    const mouthSurprised = registerPart(new THREE.Mesh(mouthSurprisedGeo, materials.mouth), {
      id: 'mouth_surprised',
      name: 'Mulut Kaget (Torus)',
      category: 'face',
      facialRole: 'mouth',
      geomType: 'torus'
    });
    mouthSurprised.position.set(0, -0.52, 1.44);
    mouthSurprised.visible = false;
    mouthGroup.add(mouthSurprised);

    // 5. Sad / Frown (Cemberut Melengkung ke Bawah)
    const mouthSadGeo = new THREE.TorusGeometry(0.24, 0.038, 16, 32, Math.PI * 0.62);
    const mouthSad = registerPart(new THREE.Mesh(mouthSadGeo, materials.mouth), {
      id: 'mouth_sad',
      name: 'Mulut Cemberut (Torus)',
      category: 'face',
      facialRole: 'mouth',
      geomType: 'torus'
    });
    mouthSad.position.set(0, -0.55, 1.44);
    mouthSad.rotation.x = -0.20;
    mouthSad.rotation.z = Math.PI * 0.19;
    mouthSad.visible = false;
    mouthGroup.add(mouthSad);

    // Cheeks (Blush)
    const cheeksGroup = new THREE.Group();
    faceGroup.add(cheeksGroup);
    function createBlush(side) {
      const blushGeo = new THREE.CircleGeometry(0.25, 24);
      blushGeo.scale(1.15, 0.75, 1.0);
      const blushMesh = registerPart(new THREE.Mesh(blushGeo, materials.cheeks), {
        id: side === -1 ? 'blush_left' : 'blush_right',
        name: side === -1 ? 'Pipi Merah Kiri' : 'Pipi Merah Kanan',
        category: 'face',
        geomType: 'circle'
      });
      blushMesh.position.set(side * 0.98, -0.36, 1.38);
      blushMesh.rotation.y = side * 0.35;
      blushMesh.rotation.x = -0.15;
      return blushMesh;
    }
    cheeksGroup.add(createBlush(-1));
    cheeksGroup.add(createBlush(1));

    // ==========================================
    // 5. NECK & COLLAR
    // ==========================================
    const neckGeo = new THREE.CylinderGeometry(0.52, 0.58, 0.55, 32);
    const neckMesh = registerPart(new THREE.Mesh(neckGeo, materials.skin), {
      id: 'neck_skin',
      name: 'Leher Kulit',
      category: 'torso',
      geomType: 'cylinder'
    });
    neckMesh.position.set(0, 5.4, 0);
    neckMesh.castShadow = true;
    rig.body.add(neckMesh);

    // Red ribbed shirt collar ring
    const collarGeo = new THREE.TorusGeometry(0.66, 0.09, 16, 48);
    const collarMesh = registerPart(new THREE.Mesh(collarGeo, materials.shirtCollar), {
      id: 'torso_collar',
      name: 'Kerah Kaos (Torus)',
      category: 'torso',
      geomType: 'torus'
    });
    collarMesh.position.set(0, 5.42, 0);
    collarMesh.rotation.x = Math.PI * 0.5;
    rig.body.add(collarMesh);

    // ==========================================
    // 6. RED T-SHIRT (TORSO) & BADGE (#1)
    // ==========================================
    const torsoGroup = new THREE.Group();
    rig.body.add(torsoGroup);

    // Bell-shaped villager shirt torso
    const shirtGeo = new THREE.CylinderGeometry(1.08, 1.30, 2.05, 48);
    const sPos = shirtGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      v.fromBufferAttribute(sPos, i);
      // Gentle rounded belly volume
      if (v.y < 0 && v.z > 0) {
        v.z += 0.12 * Math.cos((v.y / 1.02) * Math.PI * 0.5);
      }
      sPos.setXYZ(i, v.x, v.y, v.z);
    }
    shirtGeo.computeVertexNormals();

    const shirtMesh = registerPart(new THREE.Mesh(shirtGeo, materials.shirt), {
      id: 'torso_shirt',
      name: 'Kaos Badan Utama',
      category: 'torso',
      geomType: 'cylinder'
    });
    shirtMesh.position.set(0, 4.38, 0);
    shirtMesh.castShadow = true;
    shirtMesh.receiveShadow = true;
    torsoGroup.add(shirtMesh);

    // Flared bottom hem lip
    const hemGeo = new THREE.TorusGeometry(1.29, 0.09, 16, 48);
    const hemMesh = registerPart(new THREE.Mesh(hemGeo, materials.shirt), {
      id: 'torso_hem',
      name: 'Keliman Bawah Kaos',
      category: 'torso',
      geomType: 'torus'
    });
    hemMesh.position.set(0, 3.38, 0);
    hemMesh.rotation.x = Math.PI * 0.5;
    hemMesh.castShadow = true;
    torsoGroup.add(hemMesh);

    // Front Chest "#1" Badge Decal
    const badgeTexture = createBadgeTexture();
    const badgeMaterial = new THREE.MeshBasicMaterial({
      map: badgeTexture,
      transparent: true,
      depthWrite: false
    });

    const badgeGeo = new THREE.PlaneGeometry(0.95, 1.15);
    const badgeMesh = registerPart(new THREE.Mesh(badgeGeo, badgeMaterial), {
      id: 'torso_badge',
      name: 'Emblem Badge Dada No. 1',
      category: 'torso',
      geomType: 'plane'
    });
    badgeMesh.position.set(0, 4.45, 1.19);
    badgeMesh.rotation.x = -0.06; // Match torso slant
    torsoGroup.add(badgeMesh);

    // ==========================================
    // 7. ARMS & HANDS (Hierarchical Shoulder & Elbow Rig)
    // ==========================================
    function createArm(side) {
      const armRig = new THREE.Group();
      const prefix = side === -1 ? 'l' : 'r';
      const sideName = side === -1 ? 'Kiri' : 'Kanan';
      const armUpperBone = prefix === 'l' ? 'arm_upper_l' : 'arm_upper_r';
      const armLowerBone = prefix === 'l' ? 'arm_lower_l' : 'arm_lower_r';

      // Shoulder / Sleeve (Upper Arm)
      const sleeveGeo = new THREE.CylinderGeometry(0.48, 0.54, 0.95, 32);
      const sleeveMesh = registerPart(new THREE.Mesh(sleeveGeo, materials.shirt), {
        id: `arm_sleeve_${prefix}`,
        name: `Lengan Kaos ${sideName}`,
        category: armUpperBone,
        boneId: armUpperBone,
        geomType: 'cylinder'
      });
      sleeveMesh.position.set(0, -0.38, 0);
      sleeveMesh.castShadow = true;
      sleeveMesh.receiveShadow = true;

      // Shoulder seam cap
      const shoulderCapGeo = new THREE.SphereGeometry(0.49, 24, 16);
      const shoulderCap = new THREE.Mesh(shoulderCapGeo, materials.shirt);
      shoulderCap.position.set(0, 0.08, 0);
      shoulderCap.scale.set(1.0, 0.7, 1.0);
      sleeveMesh.add(shoulderCap);

      armRig.add(sleeveMesh);

      // Upper arm skin (Upper Arm)
      const limbGeo = new THREE.CylinderGeometry(0.34, 0.35, 0.55, 24);
      const limbMesh = registerPart(new THREE.Mesh(limbGeo, materials.skin), {
        id: `arm_limb_${prefix}`,
        name: `Lengan Atas Kulit ${sideName}`,
        category: armUpperBone,
        boneId: armUpperBone,
        geomType: 'cylinder'
      });
      limbMesh.position.set(0, -0.65, 0);
      limbMesh.castShadow = true;
      limbMesh.receiveShadow = true;
      armRig.add(limbMesh);

      // --- SENDI SIKU (ELBOW JOINT NODE) ---
      const elbowRig = new THREE.Group();
      elbowRig.name = `Elbow_${sideName}`;
      elbowRig.position.set(0, -0.95, 0);
      if (side === -1) rig.leftElbow = elbowRig;
      else rig.rightElbow = elbowRig;
      armRig.add(elbowRig);

      // Smooth elbow joint cap
      const elbowJointGeo = new THREE.SphereGeometry(0.33, 16, 12);
      const elbowJointMesh = new THREE.Mesh(elbowJointGeo, materials.skin);
      elbowJointMesh.position.set(0, 0, 0);
      elbowRig.add(elbowJointMesh);

      // Forearm skin (Lengan Bawah)
      const forearmGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.55, 24);
      const forearmMesh = registerPart(new THREE.Mesh(forearmGeo, materials.skin), {
        id: `arm_forearm_${prefix}`,
        name: `Lengan Bawah Kulit ${sideName}`,
        category: armLowerBone,
        boneId: armLowerBone,
        geomType: 'cylinder'
      });
      forearmMesh.position.set(0, -0.28, 0);
      forearmMesh.castShadow = true;
      forearmMesh.receiveShadow = true;
      elbowRig.add(forearmMesh);

      // Hand (Chubby palm + thumb structure)
      const handGroup = new THREE.Group();
      handGroup.position.set(0, -0.67, 0);

      // Rounded palm
      const palmGeo = new THREE.SphereGeometry(0.37, 32, 24);
      palmGeo.scale(1.0, 0.92, 0.88);
      const palmMesh = registerPart(new THREE.Mesh(palmGeo, materials.skin), {
        id: `hand_palm_${prefix}`,
        name: `Telapak Tangan ${sideName}`,
        category: armLowerBone,
        boneId: armLowerBone,
        geomType: 'sphere'
      });
      palmMesh.castShadow = true;
      handGroup.add(palmMesh);

      const thumbGeo = new THREE.SphereGeometry(0.15, 20, 16);
      thumbGeo.scale(0.85, 1.45, 0.85);
      const thumbMesh = registerPart(new THREE.Mesh(thumbGeo, materials.skin), {
        id: `hand_thumb_${prefix}`,
        name: `Jempol ${sideName}`,
        category: armLowerBone,
        boneId: armLowerBone,
        geomType: 'sphere'
      });
      thumbMesh.position.set(side * 0.18, 0.04, 0.16);
      thumbMesh.rotation.z = -side * 0.35;
      thumbMesh.rotation.x = 0.35;
      thumbMesh.castShadow = true;
      handGroup.add(thumbMesh);

      elbowRig.add(handGroup);

      // Natural relaxed stance: angled outward away from body and slightly forward
      armRig.position.set(side * 1.35, 4.9, 0.05);
      armRig.rotation.z = side * 0.28;
      armRig.rotation.x = -0.12;

      return armRig;
    }

    rig.leftArm = createArm(-1);
    rig.rightArm = createArm(1);
    rig.body.add(rig.leftArm);
    rig.body.add(rig.rightArm);

    // ==========================================
    // 8. SHORTS (PELVIS & BASE)
    // ==========================================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'PelvisGroup';
    rig.body.add(pelvisGroup);

    // Pelvis base fitting under shirt hem
    const pelvisGeo = new THREE.CylinderGeometry(1.15, 1.10, 0.85, 36);
    const pelvisMesh = registerPart(new THREE.Mesh(pelvisGeo, materials.shorts), {
      id: 'pelvis_base',
      name: 'Pangkal Celana',
      category: 'pelvis',
      boneId: 'pelvis',
      geomType: 'cylinder'
    });
    pelvisMesh.position.set(0, 3.05, 0);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    pelvisGroup.add(pelvisMesh);

    // ==========================================
    // 9. LEGS, SOCKS & BLUE SNEAKERS (Hip & Knee Joint Rig)
    // ==========================================
    function createLegAndShoe(side) {
      const prefix = side === -1 ? 'l' : 'r';
      const sideName = side === -1 ? 'Kiri' : 'Kanan';
      const legBoneId = prefix === 'l' ? 'leg_upper_l' : 'leg_upper_r';
      const kneeBoneId = prefix === 'l' ? 'leg_lower_l' : 'leg_lower_r';

      const legRig = new THREE.Group();
      legRig.name = `HipThigh_${sideName}`;
      legRig.position.set(side * 0.68, 2.3, 0);

      // --- SHORTS LEG CUFF (Attached directly to thigh rig so it swings in sync!) ---
      const legCuffGeo = new THREE.CylinderGeometry(0.60, 0.66, 0.75, 32);
      const legCuff = registerPart(new THREE.Mesh(legCuffGeo, materials.shorts), {
        id: `shorts_cuff_${prefix}`,
        name: `Cuff Celana ${sideName}`,
        category: legBoneId,
        boneId: legBoneId,
        geomType: 'cylinder'
      });
      // In legRig local space: Y = 2.45 - 2.3 = 0.15
      legCuff.position.set(0, 0.15, 0);
      legCuff.rotation.z = -side * 0.06;
      legCuff.castShadow = true;
      legCuff.receiveShadow = true;
      legRig.add(legCuff);

      // Thigh (Paha Kulit)
      const thighGeo = new THREE.CylinderGeometry(0.38, 0.37, 0.65, 24);
      const thighMesh = registerPart(new THREE.Mesh(thighGeo, materials.skin), {
        id: `leg_limb_${prefix}`,
        name: `Paha Kaki Kulit ${sideName}`,
        category: legBoneId,
        boneId: legBoneId,
        geomType: 'cylinder'
      });
      thighMesh.position.set(0, -0.32, 0);
      thighMesh.castShadow = true;
      thighMesh.receiveShadow = true;
      legRig.add(thighMesh);

      // --- SENDI LUTUT (KNEE JOINT NODE) ---
      const kneeRig = new THREE.Group();
      kneeRig.name = `Knee_${sideName}`;
      kneeRig.position.set(0, -0.65, 0);
      if (side === -1) rig.leftKnee = kneeRig;
      else rig.rightKnee = kneeRig;
      legRig.add(kneeRig);

      // Smooth knee joint cap
      const kneeJointGeo = new THREE.SphereGeometry(0.36, 16, 12);
      const kneeJointMesh = new THREE.Mesh(kneeJointGeo, materials.skin);
      kneeJointMesh.position.set(0, 0, 0);
      kneeRig.add(kneeJointMesh);

      // Shin (Betis Kaki Kulit)
      const shinGeo = new THREE.CylinderGeometry(0.37, 0.36, 0.60, 24);
      const shinMesh = registerPart(new THREE.Mesh(shinGeo, materials.skin), {
        id: `leg_shin_${prefix}`,
        name: `Betis Kaki Kulit ${sideName}`,
        category: kneeBoneId,
        boneId: kneeBoneId,
        geomType: 'cylinder'
      });
      shinMesh.position.set(0, -0.30, 0);
      shinMesh.castShadow = true;
      shinMesh.receiveShadow = true;
      kneeRig.add(shinMesh);

      // White socks band above shoe
      const sockGeo = new THREE.CylinderGeometry(0.40, 0.41, 0.32, 24);
      const sockMesh = registerPart(new THREE.Mesh(sockGeo, materials.sock), {
        id: `sock_${prefix}`,
        name: `Kaos Kaki ${sideName}`,
        category: kneeBoneId,
        boneId: kneeBoneId,
        geomType: 'cylinder'
      });
      sockMesh.position.set(0, -0.60, 0);
      sockMesh.castShadow = true;
      kneeRig.add(sockMesh);

      // Blue Sneaker (Iconic AC rounded silhouette)
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.80, 0.12);

      // Blue Upper
      const upperGeo = new THREE.SphereGeometry(0.55, 32, 24);
      upperGeo.scale(0.82, 0.68, 1.35);
      const upperMesh = registerPart(new THREE.Mesh(upperGeo, materials.shoes), {
        id: `shoe_upper_${prefix}`,
        name: `Sepatu Sneaker ${sideName}`,
        category: kneeBoneId,
        boneId: kneeBoneId,
        geomType: 'sphere'
      });
      upperMesh.position.set(0, 0.16, 0.16);
      upperMesh.castShadow = true;
      upperMesh.receiveShadow = true;
      shoeGroup.add(upperMesh);

      // White Toe Cap & Accent Stripe
      const toeCapGeo = new THREE.SphereGeometry(0.42, 24, 16);
      toeCapGeo.scale(0.85, 0.55, 0.85);
      const toeCapMesh = registerPart(new THREE.Mesh(toeCapGeo, materials.sole), {
        id: `toe_cap_${prefix}`,
        name: `Ujung Sepatu Putih ${sideName}`,
        category: kneeBoneId,
        boneId: kneeBoneId,
        geomType: 'sphere'
      });
      toeCapMesh.position.set(0, 0.12, 0.62);
      shoeGroup.add(toeCapMesh);

      // White Sneaker Sole
      const soleGeo = new THREE.CylinderGeometry(0.58, 0.60, 0.22, 32);
      soleGeo.scale(0.82, 1.0, 1.45);
      const soleMesh = registerPart(new THREE.Mesh(soleGeo, materials.sole), {
        id: `sole_${prefix}`,
        name: `Sol Sepatu ${sideName}`,
        category: kneeBoneId,
        boneId: kneeBoneId,
        geomType: 'cylinder'
      });
      soleMesh.position.set(0, -0.11, 0.18);
      soleMesh.castShadow = true;
      soleMesh.receiveShadow = true;
      shoeGroup.add(soleMesh);

      // Splay feet slightly outward (~5°) for natural balance
      shoeGroup.rotation.y = side * 0.08;

      kneeRig.add(shoeGroup);
      return legRig;
    }

    rig.leftLeg = createLegAndShoe(-1);
    rig.rightLeg = createLegAndShoe(1);
    rig.body.add(rig.leftLeg);
    rig.body.add(rig.rightLeg);

    // ==========================================
    // FIXED RIGGING SKELETON DEFINITION & JOINT GIZMOS
    // ==========================================
    const SKELETON_BONES = {
      head: {
        id: 'head',
        name: 'Kepala & Wajah',
        node: headGroup,
        parent: 'torso'
      },
      torso: {
        id: 'torso',
        name: 'Badan & Baju',
        node: torsoGroup,
        parent: 'pelvis'
      },
      pelvis: {
        id: 'pelvis',
        name: 'Panggul & Pinggang',
        node: pelvisGroup,
        parent: null
      },
      arm_upper_l: {
        id: 'arm_upper_l',
        name: 'Lengan Atas Kiri',
        node: rig.leftArm,
        parent: 'torso'
      },
      arm_lower_l: {
        id: 'arm_lower_l',
        name: 'Siku & Tangan Kiri',
        node: rig.leftElbow,
        parent: 'arm_upper_l'
      },
      arm_upper_r: {
        id: 'arm_upper_r',
        name: 'Lengan Atas Kanan',
        node: rig.rightArm,
        parent: 'torso'
      },
      arm_lower_r: {
        id: 'arm_lower_r',
        name: 'Siku & Tangan Kanan',
        node: rig.rightElbow,
        parent: 'arm_upper_r'
      },
      leg_upper_l: {
        id: 'leg_upper_l',
        name: 'Paha & Cuff Kiri',
        node: rig.leftLeg,
        parent: 'pelvis'
      },
      leg_lower_l: {
        id: 'leg_lower_l',
        name: 'Lutut & Kaki Kiri',
        node: rig.leftKnee,
        parent: 'leg_upper_l'
      },
      leg_upper_r: {
        id: 'leg_upper_r',
        name: 'Paha & Cuff Kanan',
        node: rig.rightLeg,
        parent: 'pelvis'
      },
      leg_lower_r: {
        id: 'leg_lower_r',
        name: 'Lutut & Kaki Kanan',
        node: rig.rightKnee,
        parent: 'leg_upper_r'
      }
    };
    rig.bones = SKELETON_BONES;

    // Joint Gizmos & Visual Skeleton
    const jointGizmos = [];
    for (const [boneId, bDef] of Object.entries(SKELETON_BONES)) {
      const gizmoGroup = new THREE.Group();
      gizmoGroup.name = `JointGizmo_${boneId}`;
      const gizmoGeo = new THREE.SphereGeometry(0.14, 16, 12);
      const gizmoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        depthTest: false,
        transparent: true,
        opacity: 0.85
      });
      const gizmoSphere = new THREE.Mesh(gizmoGeo, gizmoMat);
      gizmoSphere.renderOrder = 999;
      gizmoGroup.add(gizmoSphere);

      const axes = new THREE.AxesHelper(0.35);
      axes.material.depthTest = false;
      axes.material.transparent = true;
      axes.material.opacity = 0.9;
      axes.renderOrder = 999;
      gizmoGroup.add(axes);

      gizmoGroup.visible = false;
      bDef.node.add(gizmoGroup);
      bDef.gizmo = gizmoGroup;
      jointGizmos.push(gizmoGroup);
    }

    let isSkeletonHelperVisible = false;
    rig.setSkeletonVisibility = function (visible) {
      isSkeletonHelperVisible = !!visible;
      jointGizmos.forEach((g) => {
        g.visible = isSkeletonHelperVisible;
      });
    };
    rig.getSkeletonVisibility = function () {
      return isSkeletonHelperVisible;
    };

    // ==========================================
    // 10. STUDIO PLATFORM & GROUND PEDESTAL
    // ==========================================
    const pedestalGroup = new THREE.Group();
    character.add(pedestalGroup);

    const pedestalGeo = new THREE.CylinderGeometry(3.8, 4.0, 0.25, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: PALETTE.platform,
      roughness: 0.85,
      metalness: 0.02
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.125, 0);
    pedestal.receiveShadow = true;
    pedestalGroup.add(pedestal);

    // Subtle dark contact shadow disc beneath feet
    const shadowGeo = new THREE.CircleGeometry(1.65, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x222a35,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI * 0.5;
    contactShadow.position.set(0, 0.005, 0.15);
    pedestalGroup.add(contactShadow);

    // Initial pose: facing forward (neutral standing pose)
    character.rotation.y = 0;

    // ==========================================
    // 11. REAL-TIME CUSTOMIZATION API
    // ==========================================
    const currentConfig = {
      colors: {
        skin: '#fcd4b8',
        hair: '#1e0f08',
        shirt: '#c91815',
        badgeBg: '#00bfe6',
        badgeText: '#ffffff',
        shorts: '#161e2b',
        shoes: '#1458b8',
        sole: '#f8f9fa',
        sock: '#ffffff',
        eyes: '#111111',
        cheeks: '#ff7777'
      },
      badge: {
        text: '1',
        shape: 'rounded-rect'
      },
      proportions: {
        headScaleX: 1.0,
        headScaleY: 1.0,
        earScale: 1.0,
        bodyChubby: 1.0,
        armAngle: 0.28
      },
      hairStyle: 'bowl-cut',
      expression: {
        mouth: 'smile',
        eyeStyle: 'oval',
        blush: true
      }
    };

    rig.materials = materials;
    rig.headGroup = headGroup;
    rig.torsoGroup = torsoGroup;
    rig.pelvisGroup = pelvisGroup;
    rig.hairStyles = hairStyles;

    rig.updateColors = function (colors) {
      if (!colors) return;
      Object.assign(currentConfig.colors, colors);
      if (colors.skin) materials.skin.color.set(colors.skin);
      if (colors.hair) materials.hair.color.set(colors.hair);
      if (colors.shirt) {
        materials.shirt.color.set(colors.shirt);
        materials.shirtCollar.color.set(colors.shirt);
      }
      if (colors.shorts) materials.shorts.color.set(colors.shorts);
      if (colors.shoes) materials.shoes.color.set(colors.shoes);
      if (colors.sole) materials.sole.color.set(colors.sole);
      if (colors.sock) materials.sock.color.set(colors.sock);
      if (colors.eyes) materials.eyes.color.set(colors.eyes);
      if (colors.cheeks) materials.cheeks.color.set(colors.cheeks);
      if (colors.badgeBg || colors.badgeText) {
        rig.updateBadge({
          bgColor: currentConfig.colors.badgeBg,
          textColor: currentConfig.colors.badgeText
        });
      }
    };

    rig.updateBadge = function (badgeCfg) {
      if (!badgeCfg) return;
      Object.assign(currentConfig.badge, badgeCfg);
      if (badgeCfg.bgColor) currentConfig.colors.badgeBg = badgeCfg.bgColor;
      if (badgeCfg.textColor) currentConfig.colors.badgeText = badgeCfg.textColor;

      if (badgeTexture && badgeTexture.updateBadge) {
        badgeTexture.updateBadge({
          text: currentConfig.badge.text,
          shape: currentConfig.badge.shape,
          bgColor: currentConfig.colors.badgeBg,
          textColor: currentConfig.colors.badgeText
        });
      }
      if (currentConfig.badge.shape === 'none') {
        badgeMesh.visible = false;
      } else {
        badgeMesh.visible = true;
      }
    };

    rig.updateProportions = function (props) {
      if (!props) return;
      Object.assign(currentConfig.proportions, props);

      if (props.headScaleX !== undefined || props.headScaleY !== undefined) {
        const sx = currentConfig.proportions.headScaleX;
        const sy = currentConfig.proportions.headScaleY;
        headGroup.scale.set(sx, sy, (sx + sy) * 0.5);
      }

      if (props.earScale !== undefined) {
        const es = currentConfig.proportions.earScale;
        gltfHeadContainer.traverse((child) => {
          if (child.isMesh && (child.name.toLowerCase().includes('cylinder') || child === baseLeftEar || child === baseRightEar)) {
            if (!child.userData.baseScale) {
              child.userData.baseScale = child.scale.clone();
            }
            child.scale.set(
              child.userData.baseScale.x * es,
              child.userData.baseScale.y * es,
              child.userData.baseScale.z * es
            );
          }
        });
      }

      if (props.bodyChubby !== undefined) {
        const bc = currentConfig.proportions.bodyChubby;
        torsoGroup.scale.set(bc, 1.0, bc);
        pelvisGroup.scale.set(bc, 1.0, bc);
      }

      if (props.armAngle !== undefined) {
        const aa = currentConfig.proportions.armAngle;
        if (rig.leftArm && rig.rightArm) {
          rig.leftArm.rotation.z = -aa;
          rig.rightArm.rotation.z = aa;
        }
      }
    };

    rig.updateHairStyle = function (style) {
      if (!style) return;
      currentConfig.hairStyle = style;
      hairStyles.bowlCut.visible = (style === 'bowl-cut' || style === 'bowlCut');
      hairStyles.shortCrop.visible = (style === 'short' || style === 'shortCrop');
      hairStyles.spiky.visible = (style === 'spiky');
      // 'bald' leaves all hair groups invisible
    };

    rig.updateExpression = function (expr) {
      if (!expr) return;
      Object.assign(currentConfig.expression, expr);

      const m = currentConfig.expression.mouth;
      mouthSmile.visible = (m === 'smile' || !m);
      mouthLaugh.visible = (m === 'laugh');
      mouthNeutral.visible = (m === 'neutral');
      mouthSurprised.visible = (m === 'surprised');
      mouthSad.visible = (m === 'sad');

      const eye = currentConfig.expression.eyeStyle;
      if (eye === 'wink') {
        rightEyeNormal.visible = false;
        winkMesh.visible = true;
      } else {
        rightEyeNormal.visible = true;
        winkMesh.visible = false;
      }

      cheeksGroup.visible = !!currentConfig.expression.blush;
    };

    rig.applyConfig = function (cfg) {
      if (!cfg) return;
      if (cfg.colors) rig.updateColors(cfg.colors);
      if (cfg.badge) rig.updateBadge(cfg.badge);
      if (cfg.proportions) rig.updateProportions(cfg.proportions);
      if (cfg.hairStyle) rig.updateHairStyle(cfg.hairStyle);
      if (cfg.expression) rig.updateExpression(cfg.expression);
    };

    rig.getConfig = function () {
      return JSON.parse(JSON.stringify(currentConfig));
    };

    // ==========================================
    // 12. MODULAR HIERARCHY & PART EDITOR API
    // ==========================================
    rig.registeredParts = registeredParts;
    rig.selectionBox = selectionBox;
    rig.selectedPartId = null;
    rig.groups = {
      head: headGroup,
      hair: hairGroup,
      face: faceGroup,
      ears: gltfHeadContainer,
      torso: torsoGroup,
      arms: rig.body,
      legs: pelvisGroup
    };

    rig.selectObject = function (partId) {
      if (!partId) {
        rig.selectedPartId = null;
        selectionBox.visible = false;
        return null;
      }
      const mesh = registeredParts.get(partId);
      if (mesh && mesh.visible) {
        rig.selectedPartId = partId;
        selectionBox.setFromObject(mesh);
        selectionBox.visible = true;
        return mesh;
      }
      rig.selectedPartId = null;
      selectionBox.visible = false;
      return null;
    };

    rig.getObjectList = function () {
      const list = [];
      for (const [id, mesh] of registeredParts.entries()) {
        if (!mesh || !mesh.parent) continue;
        list.push({
          id: id,
          name: mesh.name || id,
          category: mesh.userData.category || 'misc',
          boneId: mesh.userData.boneId || mesh.userData.category || 'torso',
          facialRole: mesh.userData.facialRole || 'none',
          geomType: mesh.userData.isGroup ? 'group' : (mesh.userData.geomType || 'Mesh'),
          isGroup: !!mesh.userData.isGroup,
          parentGroupId: mesh.userData.parentGroupId || null,
          childIds: mesh.userData.childIds ? [...mesh.userData.childIds] : [],
          isSliced: !!mesh.userData.isSliced,
          sliceAxis: mesh.userData.sliceAxis || null,
          isSculpted: !!mesh.userData.isSculpted,
          isCustom: !!mesh.userData.isCustom,
          visible: mesh.visible,
          position: {
            x: +(mesh.position.x).toFixed(3),
            y: +(mesh.position.y).toFixed(3),
            z: +(mesh.position.z).toFixed(3)
          },
          rotation: {
            x: +(THREE.MathUtils.radToDeg(mesh.rotation.x)).toFixed(1),
            y: +(THREE.MathUtils.radToDeg(mesh.rotation.y)).toFixed(1),
            z: +(THREE.MathUtils.radToDeg(mesh.rotation.z)).toFixed(1)
          },
          scale: {
            x: +(mesh.scale.x).toFixed(3),
            y: +(mesh.scale.y).toFixed(3),
            z: +(mesh.scale.z).toFixed(3)
          },
          color: (mesh.material && mesh.material.color)
            ? '#' + mesh.material.color.getHexString()
            : '#ffffff',
          roughness: (mesh.material && mesh.material.roughness !== undefined)
            ? mesh.material.roughness
            : 0.65
        });
      }
      return list;
    };

    rig.updateObjectTransform = function (partId, t = {}) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return;
      if (t.position) {
        if (t.position.x !== undefined) mesh.position.x = parseFloat(t.position.x);
        if (t.position.y !== undefined) mesh.position.y = parseFloat(t.position.y);
        if (t.position.z !== undefined) mesh.position.z = parseFloat(t.position.z);
      }
      if (t.rotation) {
        if (t.rotation.x !== undefined) mesh.rotation.x = THREE.MathUtils.degToRad(parseFloat(t.rotation.x));
        if (t.rotation.y !== undefined) mesh.rotation.y = THREE.MathUtils.degToRad(parseFloat(t.rotation.y));
        if (t.rotation.z !== undefined) mesh.rotation.z = THREE.MathUtils.degToRad(parseFloat(t.rotation.z));
      }
      if (t.scale) {
        if (t.scale.x !== undefined) mesh.scale.x = parseFloat(t.scale.x);
        if (t.scale.y !== undefined) mesh.scale.y = parseFloat(t.scale.y);
        if (t.scale.z !== undefined) mesh.scale.z = parseFloat(t.scale.z);
      }
      if (rig.selectedPartId === partId && selectionBox.visible) {
        selectionBox.update();
      }
    };

    rig.updateObjectMaterial = function (partId, m = {}) {
      const mesh = registeredParts.get(partId);
      if (!mesh || !mesh.material) return;
      if (!mesh.userData.hasOwnMaterial) {
        mesh.material = mesh.material.clone();
        mesh.userData.hasOwnMaterial = true;
      }
      if (m.color) mesh.material.color.set(m.color);
      if (m.roughness !== undefined) mesh.material.roughness = parseFloat(m.roughness);
      if (m.opacity !== undefined) {
        mesh.material.opacity = parseFloat(m.opacity);
        mesh.material.transparent = mesh.material.opacity < 1.0;
      }
    };

    rig.setObjectVisibility = function (partId, visible) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return;
      mesh.visible = !!visible;
      if (rig.selectedPartId === partId) {
        if (mesh.visible) {
          selectionBox.update();
          selectionBox.visible = true;
        } else {
          selectionBox.visible = false;
        }
      }
    };

    rig.resetObjectTransform = function (partId) {
      const mesh = registeredParts.get(partId);
      if (!mesh || !mesh.userData.defaultTransform) return;
      const def = mesh.userData.defaultTransform;
      mesh.position.copy(def.position);
      mesh.rotation.copy(def.rotation);
      mesh.scale.copy(def.scale);
      if (rig.selectedPartId === partId && selectionBox.visible) {
        selectionBox.update();
      }
    };

    rig.addPrimitivePart = function (params = {}) {
      const type = params.type || 'cone';
      let geo;
      if (type === 'cone') {
        geo = new THREE.ConeGeometry(0.35, 0.65, 24);
        geo.rotateX(Math.PI);
      } else if (type === 'sphere') {
        geo = new THREE.SphereGeometry(0.28, 24, 16);
      } else if (type === 'cylinder') {
        geo = new THREE.CylinderGeometry(0.24, 0.24, 0.6, 24);
      } else if (type === 'box') {
        geo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      } else if (type === 'torus') {
        geo = new THREE.TorusGeometry(0.25, 0.07, 16, 24);
      } else {
        geo = new THREE.ConeGeometry(0.35, 0.65, 24);
      }

      const col = params.color || '#1e0f08';
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(col),
        roughness: 0.65,
        metalness: 0.05
      });
      const newMesh = new THREE.Mesh(geo, mat);
      newMesh.castShadow = true;
      newMesh.receiveShadow = true;
      newMesh.userData.hasOwnMaterial = true;

      const p = params.position || { x: 0, y: 0.2, z: 1.4 };
      newMesh.position.set(p.x, p.y, p.z);
      if (params.rotation) {
        newMesh.rotation.set(
          THREE.MathUtils.degToRad(params.rotation.x || 0),
          THREE.MathUtils.degToRad(params.rotation.y || 0),
          THREE.MathUtils.degToRad(params.rotation.z || 0)
        );
      }
      if (params.scale) {
        newMesh.scale.set(params.scale.x || 1, params.scale.y || 1, params.scale.z || 1);
      }

      const targetBoneId = params.parentGroupId || params.boneId || 'head';
      const parentTarget = getBoneNode(targetBoneId);
      parentTarget.add(newMesh);

      const name = params.name || `Custom_${type.toUpperCase()}_${nextCustomId}`;
      registerPart(newMesh, {
        name: name,
        category: targetBoneId,
        boneId: targetBoneId,
        geomType: type,
        isCustom: true
      });

      rig.selectObject(newMesh.userData.partId);
      return newMesh.userData.partId;
    };

    rig.duplicateObject = function (partId, mirrorX = false) {
      const orig = registeredParts.get(partId);
      if (!orig || !orig.parent) return null;

      const clone = orig.clone();
      if (orig.material) {
        clone.material = orig.material.clone();
        clone.userData.hasOwnMaterial = true;
      }
      if (mirrorX) {
        clone.position.x = -orig.position.x;
        clone.rotation.y = -orig.rotation.y;
        clone.rotation.z = -orig.rotation.z;
        clone.name = (orig.name || 'Part') + '_Mirror';
      } else {
        clone.position.x += 0.15;
        clone.name = (orig.name || 'Part') + '_Copy';
      }

      orig.parent.add(clone);
      registerPart(clone, {
        name: clone.name,
        category: orig.userData.category || 'head',
        boneId: orig.userData.boneId || orig.userData.category || 'head',
        geomType: orig.userData.geomType || 'Mesh',
        isCustom: true
      });

      rig.selectObject(clone.userData.partId);
      return clone.userData.partId;
    };

    rig.deleteObject = function (partId) {
      const mesh = registeredParts.get(partId);
      if (!mesh || !mesh.parent) return false;
      if (mesh.userData.isGroup) {
        return rig.ungroup(partId);
      }
      if (rig.selectedPartId === partId) {
        selectionBox.visible = false;
        rig.selectedPartId = null;
      }
      mesh.parent.remove(mesh);
      registeredParts.delete(partId);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      return true;
    };

    function getBoneNode(targetId) {
      if (SKELETON_BONES[targetId]) return SKELETON_BONES[targetId].node;
      if (targetId === 'hair') return hairGroup;
      if (targetId === 'face') return faceGroup;
      if (targetId === 'ears') return gltfHeadContainer || headGroup;
      if (targetId === 'head') return headGroup;
      if (targetId === 'torso') return torsoGroup;
      if (targetId === 'pelvis') return pelvisGroup;
      if (targetId === 'arms') return rig.leftArm;
      if (targetId === 'legs') return rig.leftLeg;
      return headGroup;
    }

    rig.getBoneNode = getBoneNode;

    rig.reparentObject = function (partId, targetGroupId) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return false;
      const targetGroup = getBoneNode(targetGroupId);
      if (targetGroup && mesh.parent !== targetGroup) {
        targetGroup.attach(mesh);
        mesh.userData.boneId = targetGroupId;
        mesh.userData.category = targetGroupId;
        if (rig.selectedPartId === partId && selectionBox.visible) {
          selectionBox.update();
        }
      }
      return true;
    };

    // ==========================================
    // REAL GROUPING & UNGROUPING SYSTEM
    // ==========================================
    let nextGroupId = 1;
    const registeredGroups = new Map();

    rig.createCustomGroup = function (groupName, partIds = [], targetBoneId = null) {
      if (!partIds || partIds.length === 0) return null;

      const validMeshes = [];
      const center = new THREE.Vector3();
      const tempP = new THREE.Vector3();

      let determinedBoneId = targetBoneId;

      for (const pid of partIds) {
        const m = registeredParts.get(pid);
        if (m && m.parent && !m.userData.isGroup) {
          validMeshes.push(m);
          m.getWorldPosition(tempP);
          center.add(tempP);
          if (!determinedBoneId) {
            determinedBoneId = m.userData.boneId || 'head';
          }
        }
      }

      if (validMeshes.length === 0) return null;
      center.divideScalar(validMeshes.length);
      if (!determinedBoneId) determinedBoneId = 'head';

      const parentBoneNode = getBoneNode(determinedBoneId);
      const groupNode = new THREE.Group();

      // Convert center to local space of bone
      const localCenter = center.clone();
      parentBoneNode.worldToLocal(localCenter);
      groupNode.position.copy(localCenter);

      parentBoneNode.add(groupNode);

      const groupId = `custom_group_${nextGroupId++}`;
      const name = groupName || `Grup_${nextGroupId - 1}`;
      groupNode.name = name;
      groupNode.userData.partId = groupId;
      groupNode.userData.partName = name;
      groupNode.userData.isGroup = true;
      groupNode.userData.boneId = determinedBoneId;
      groupNode.userData.category = determinedBoneId;
      groupNode.userData.childIds = [];

      for (const m of validMeshes) {
        groupNode.attach(m);
        m.userData.parentGroupId = groupId;
        groupNode.userData.childIds.push(m.userData.partId);
      }

      registeredParts.set(groupId, groupNode);
      registeredGroups.set(groupId, groupNode);

      rig.selectObject(groupId);
      return groupId;
    };

    rig.ungroup = function (groupId) {
      const groupNode = registeredGroups.get(groupId) || registeredParts.get(groupId);
      if (!groupNode || !groupNode.userData.isGroup) return false;

      const boneId = groupNode.userData.boneId || 'head';
      const targetBoneNode = getBoneNode(boneId);

      // Re-attach all children back to the bone node
      while (groupNode.children.length > 0) {
        const child = groupNode.children[0];
        targetBoneNode.attach(child);
        delete child.userData.parentGroupId;
        child.userData.boneId = boneId;
        child.userData.category = boneId;
      }

      if (groupNode.parent) {
        groupNode.parent.remove(groupNode);
      }

      registeredParts.delete(groupId);
      registeredGroups.delete(groupId);

      if (rig.selectedPartId === groupId) {
        selectionBox.visible = false;
        rig.selectedPartId = null;
      }

      return true;
    };

    rig.addPartToGroup = function (partId, groupId) {
      const mesh = registeredParts.get(partId);
      const groupNode = registeredGroups.get(groupId) || registeredParts.get(groupId);
      if (!mesh || !groupNode || !groupNode.userData.isGroup) return false;

      groupNode.attach(mesh);
      mesh.userData.parentGroupId = groupId;
      if (!groupNode.userData.childIds.includes(partId)) {
        groupNode.userData.childIds.push(partId);
      }
      return true;
    };

    rig.removePartFromGroup = function (partId) {
      const mesh = registeredParts.get(partId);
      if (!mesh || !mesh.userData.parentGroupId) return false;

      const groupId = mesh.userData.parentGroupId;
      const groupNode = registeredParts.get(groupId);
      const boneId = groupNode?.userData?.boneId || 'head';
      const targetBone = getBoneNode(boneId);

      targetBone.attach(mesh);
      delete mesh.userData.parentGroupId;
      mesh.userData.boneId = boneId;

      if (groupNode && groupNode.userData.childIds) {
        groupNode.userData.childIds = groupNode.userData.childIds.filter((id) => id !== partId);
      }
      return true;
    };

    // ==========================================
    // MESH SLICING & HALF-CUT (Potong Separuh)
    // ==========================================
    rig.sliceObjectHalf = function (partId, axis = 'x', invert = false) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return false;

      // Ensure mesh has its own material
      if (!mesh.userData.hasOwnMaterial && mesh.material) {
        mesh.material = mesh.material.clone();
        mesh.userData.hasOwnMaterial = true;
      }

      const sign = invert ? -1 : 1;
      const normal = new THREE.Vector3(
        axis === 'x' ? sign : 0,
        axis === 'y' ? sign : 0,
        axis === 'z' ? sign : 0
      );

      const plane = new THREE.Plane(normal, 0);
      mesh.material.clippingPlanes = [plane];
      mesh.material.clipShadows = true;
      mesh.material.needsUpdate = true;

      mesh.userData.isSliced = true;
      mesh.userData.sliceAxis = axis;
      mesh.userData.sliceInvert = invert;
      mesh.userData.clippingPlane = plane;

      if (rig.selectedPartId === partId && selectionBox.visible) {
        selectionBox.update();
      }
      return true;
    };

    rig.restoreOriginalGeometry = function (partId) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return false;

      if (mesh.userData.originalGeometry && mesh.geometry) {
        mesh.geometry.dispose();
        mesh.geometry = mesh.userData.originalGeometry.clone();
        mesh.geometry.computeVertexNormals();
      }

      if (mesh.material) {
        mesh.material.clippingPlanes = [];
        mesh.material.needsUpdate = true;
      }

      mesh.userData.isSliced = false;
      mesh.userData.isSculpted = false;
      delete mesh.userData.sliceAxis;
      delete mesh.userData.sliceInvert;
      delete mesh.userData.clippingPlane;

      if (rig.selectedPartId === partId && selectionBox.visible) {
        selectionBox.update();
      }
      return true;
    };

    // ==========================================
    // FREEFORM VERTEX SCULPTING (Bentuk Leluasa)
    // ==========================================
    rig.sculptObjectVertex = function (partId, hitPointLocal, hitNormalLocal, brushType = 'pull', radius = 0.35, strength = 0.15) {
      const mesh = registeredParts.get(partId);
      if (!mesh || !mesh.geometry) return false;

      const posAttr = mesh.geometry.attributes.position;
      if (!posAttr) return false;

      if (!mesh.userData.originalGeometry) {
        mesh.userData.originalGeometry = mesh.geometry.clone();
      }

      if (!mesh.userData.isSculpted) {
        mesh.geometry = mesh.geometry.clone();
        mesh.userData.isSculpted = true;
      }

      const pAttr = mesh.geometry.attributes.position;
      const hx = hitPointLocal.x;
      const hy = hitPointLocal.y;
      const hz = hitPointLocal.z;

      const nx = hitNormalLocal ? hitNormalLocal.x : 0;
      const ny = hitNormalLocal ? hitNormalLocal.y : 1;
      const nz = hitNormalLocal ? hitNormalLocal.z : 0;

      let modified = 0;
      for (let i = 0; i < pAttr.count; i++) {
        const vx = pAttr.getX(i);
        const vy = pAttr.getY(i);
        const vz = pAttr.getZ(i);

        const dx = vx - hx;
        const dy = vy - hy;
        const dz = vz - hz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < radius) {
          const factor = Math.cos((dist / radius) * (Math.PI * 0.5)) * strength;

          if (brushType === 'pull') {
            pAttr.setXYZ(i, vx + nx * factor, vy + ny * factor, vz + nz * factor);
          } else if (brushType === 'push') {
            pAttr.setXYZ(i, vx - nx * factor, vy - ny * factor, vz - nz * factor);
          } else if (brushType === 'smooth') {
            pAttr.setXYZ(i, vx + (hx - vx) * factor * 0.4, vy + (hy - vy) * factor * 0.4, vz + (hz - vz) * factor * 0.4);
          }
          modified++;
        }
      }

      if (modified > 0) {
        pAttr.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
        if (rig.selectedPartId === partId && selectionBox.visible) {
          selectionBox.update();
        }
      }
      return true;
    };

    // ==========================================
    // 3D FACIAL MARKERS (Tanda di Bagian Kepala) & FACIAL ROLES
    // ==========================================
    const facialMarkersGroup = new THREE.Group();
    facialMarkersGroup.name = 'FacialMarkersGroup';
    facialMarkersGroup.visible = false;
    headGroup.add(facialMarkersGroup);

    function createFacialMarker(label, colorHex) {
      const g = new THREE.Group();
      // Glowing sphere ring pin
      const pinGeo = new THREE.SphereGeometry(0.09, 16, 12);
      const pinMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        depthTest: false,
        transparent: true,
        opacity: 0.95
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.renderOrder = 1000;
      g.add(pin);

      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        depthTest: false,
        transparent: true,
        opacity: 0.85
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.renderOrder = 1000;
      g.add(ring);

      // Canvas badge text sprite
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(4, 4, 152, 40, 8);
      else ctx.rect(4, 4, 152, 40);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 80, 24);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.65, 0.20, 1.0);
      sprite.position.set(0, 0.24, 0);
      sprite.renderOrder = 1001;
      g.add(sprite);

      return g;
    }

    const markerEyeL = createFacialMarker('👁️ Mata Kiri', '#00e5ff');
    const markerEyeR = createFacialMarker('👁️ Mata Kanan', '#00e5ff');
    const markerMouth = createFacialMarker('👄 Mulut', '#ff3366');
    facialMarkersGroup.add(markerEyeL);
    facialMarkersGroup.add(markerEyeR);
    facialMarkersGroup.add(markerMouth);

    const tempMarkerVec = new THREE.Vector3();
    function updateFacialMarkers() {
      // Find active left eye
      let posL = new THREE.Vector3(-0.60, -0.10, 1.55);
      const eyeLParts = rig.getPartsByFacialRole('eye_left');
      if (eyeLParts.length > 0 && eyeLParts[0].parent) {
        eyeLParts[0].getWorldPosition(tempMarkerVec);
        headGroup.worldToLocal(tempMarkerVec);
        posL.copy(tempMarkerVec);
        posL.z += 0.08;
      }
      markerEyeL.position.copy(posL);

      // Find active right eye
      let posR = new THREE.Vector3(0.60, -0.10, 1.55);
      const eyeRParts = rig.getPartsByFacialRole('eye_right');
      if (eyeRParts.length > 0 && eyeRParts[0].parent) {
        eyeRParts[0].getWorldPosition(tempMarkerVec);
        headGroup.worldToLocal(tempMarkerVec);
        posR.copy(tempMarkerVec);
        posR.z += 0.08;
      }
      markerEyeR.position.copy(posR);

      // Find active mouth
      let posM = new THREE.Vector3(0, -0.52, 1.55);
      const mouthParts = rig.getPartsByFacialRole('mouth');
      if (mouthParts.length > 0 && mouthParts[0].parent) {
        mouthParts[0].getWorldPosition(tempMarkerVec);
        headGroup.worldToLocal(tempMarkerVec);
        posM.copy(tempMarkerVec);
        posM.z += 0.08;
      }
      markerMouth.position.copy(posM);
    }

    rig.setFacialMarkersVisibility = function (visible) {
      facialMarkersGroup.visible = !!visible;
      if (facialMarkersGroup.visible) {
        updateFacialMarkers();
      }
    };
    rig.getFacialMarkersVisibility = function () {
      return facialMarkersGroup.visible;
    };
    rig.updateFacialMarkers = updateFacialMarkers;

    rig.setFacialRole = function (partId, role) {
      const mesh = registeredParts.get(partId);
      if (!mesh) return false;
      mesh.userData.facialRole = role || 'none';
      updateFacialMarkers();
      return true;
    };

    rig.getPartsByFacialRole = function (role) {
      const result = [];
      for (const [_, mesh] of registeredParts.entries()) {
        if (mesh && mesh.userData && mesh.userData.facialRole === role) {
          result.push(mesh);
        }
      }
      return result;
    };

    rig.getFacialRoles = function () {
      const roles = { eye_left: [], eye_right: [], mouth: [], nose: [] };
      for (const [id, mesh] of registeredParts.entries()) {
        const r = mesh.userData?.facialRole;
        if (r && roles[r]) {
          roles[r].push(id);
        }
      }
      return roles;
    };

    rig.setBlinkSettings = function (settings) {
      if (rig.animator) rig.animator.setBlinkSettings(settings);
    };
    rig.getBlinkSettings = function () {
      return rig.animator ? rig.animator.getBlinkSettings() : {};
    };
    rig.triggerBlink = function () {
      if (rig.animator) rig.animator.triggerBlink();
    };

    rig.setMouthSettings = function (settings) {
      if (rig.animator) rig.animator.setMouthSettings(settings);
    };
    rig.getMouthSettings = function () {
      return rig.animator ? rig.animator.getMouthSettings() : {};
    };

    rig.animator = new CharacterAnimator(rig);

    return rig;
  }

  // --- PROCEDURAL ANIMATION & MULTI-MOTION ENGINE ---
  class CharacterAnimator {
    constructor(rig) {
      this.rig = rig;
      this.enabled = true;
      this.isPaused = false;
      this.currentMotion = 'idle'; // 'idle', 'walk', 'run', 'wave', 'dance', 'cheer', 'pose'
      this.speed = 1.0;
      this.time = 0;
      this.blinkTimer = 0;
      this.isBlinking = false;
      this.triggerBlinkOnce = false;
      this.blinkSettings = {
        autoBlink: true,
        interval: 3.8,
        duration: 0.14,
        manualBlink: 0.0,
        mode: 'both' // 'both', 'left', 'right', 'closed'
      };

      this.mouthSettings = {
        condition: 'smile', // 'smile', 'laugh', 'neutral', 'surprised', 'sad'
        open: 0.0,
        width: 1.0,
        curve: 0.5,
        autoTalk: false
      };
      this.talkTimer = 0;

      this.manualPose = false;
      this.poseData = {
        headPitch: 0,
        headYaw: 0,
        headRoll: 0,
        lArmPitch: 0,
        lArmRoll: 0,
        lElbowFlex: 0,
        rArmPitch: 0,
        rArmRoll: 0,
        rElbowFlex: 0,
        lLegPitch: 0,
        lKneeFlex: 0,
        rLegPitch: 0,
        rKneeFlex: 0
      };
    }

    setBlinkSettings(settings = {}) {
      Object.assign(this.blinkSettings, settings);
    }

    getBlinkSettings() {
      return { ...this.blinkSettings };
    }

    triggerBlink() {
      this.isBlinking = true;
      this.blinkTimer = 0;
      this.triggerBlinkOnce = true;
    }

    setMouthSettings(settings = {}) {
      Object.assign(this.mouthSettings, settings);
      if (settings.condition && this.rig && this.rig.updateExpression) {
        this.rig.updateExpression({ mouth: settings.condition });
      }
    }

    getMouthSettings() {
      return { ...this.mouthSettings };
    }

    setMotion(motionName) {
      if (['idle', 'walk', 'run', 'wave', 'dance', 'cheer', 'pose'].includes(motionName)) {
        this.currentMotion = motionName;
        this.manualPose = (motionName === 'pose');
        this.resetPose();
        if (this.manualPose) {
          this.applyManualPose();
        }
      }
    }

    setSpeed(speedVal) {
      const spd = parseFloat(speedVal);
      if (!isNaN(spd) && spd > 0) {
        this.speed = spd;
      }
    }

    setPaused(paused) {
      this.isPaused = !!paused;
    }

    setManualPose(pose = {}) {
      Object.assign(this.poseData, pose);
      this.manualPose = true;
      this.currentMotion = 'pose';
      this.applyManualPose();
    }

    applyManualPose() {
      if (!this.rig) return;
      const p = this.poseData;

      if (this.rig.body) {
        this.rig.body.position.set(0, 0, 0);
        this.rig.body.rotation.set(0, 0, 0);
        this.rig.body.scale.set(1, 1, 1);
      }

      if (this.rig.head) {
        this.rig.head.rotation.set(
          THREE.MathUtils.degToRad(p.headPitch || 0),
          THREE.MathUtils.degToRad(p.headYaw || 0),
          THREE.MathUtils.degToRad(p.headRoll || 0)
        );
      }

      if (this.rig.leftArm) {
        this.rig.leftArm.rotation.set(
          -0.12 + THREE.MathUtils.degToRad(p.lArmPitch || 0),
          0,
          -0.28 - THREE.MathUtils.degToRad(p.lArmRoll || 0)
        );
      }
      if (this.rig.leftElbow) {
        this.rig.leftElbow.rotation.set(
          -THREE.MathUtils.degToRad(p.lElbowFlex || 0),
          0,
          0
        );
      }

      if (this.rig.rightArm) {
        this.rig.rightArm.rotation.set(
          -0.12 + THREE.MathUtils.degToRad(p.rArmPitch || 0),
          0,
          0.28 + THREE.MathUtils.degToRad(p.rArmRoll || 0)
        );
      }
      if (this.rig.rightElbow) {
        this.rig.rightElbow.rotation.set(
          -THREE.MathUtils.degToRad(p.rElbowFlex || 0),
          0,
          0
        );
      }

      if (this.rig.leftLeg) {
        this.rig.leftLeg.rotation.set(
          THREE.MathUtils.degToRad(p.lLegPitch || 0),
          0,
          0
        );
      }
      if (this.rig.leftKnee) {
        this.rig.leftKnee.rotation.set(
          THREE.MathUtils.degToRad(p.lKneeFlex || 0),
          0,
          0
        );
      }

      if (this.rig.rightLeg) {
        this.rig.rightLeg.rotation.set(
          THREE.MathUtils.degToRad(p.rLegPitch || 0),
          0,
          0
        );
      }
      if (this.rig.rightKnee) {
        this.rig.rightKnee.rotation.set(
          THREE.MathUtils.degToRad(p.rKneeFlex || 0),
          0,
          0
        );
      }
    }

    update(delta) {
      if (!this.enabled || !this.rig) return;

      this.updateBlink(delta);
      this.updateMouth(delta);

      if (this.isPaused) return;

      if (this.currentMotion === 'pose' || this.manualPose) {
        this.applyManualPose();
        return;
      }

      this.time += delta * this.speed;
      const t = this.time;

      switch (this.currentMotion) {
        case 'walk':
          this.animateWalk(t);
          break;
        case 'run':
          this.animateRun(t);
          break;
        case 'wave':
          this.animateWave(t);
          break;
        case 'dance':
          this.animateDance(t);
          break;
        case 'cheer':
          this.animateCheer(t);
          break;
        case 'idle':
        default:
          this.animateIdle(t);
          break;
      }
    }

    animateIdle(t) {
      const breath = Math.sin(t * 2.2);
      if (this.rig.body) {
        this.rig.body.position.set(0, breath * 0.035, 0);
        this.rig.body.rotation.set(0, 0, 0);
        this.rig.body.scale.set(
          1.0 + breath * 0.008,
          1.0 - breath * 0.004,
          1.0 + breath * 0.008
        );
      }

      const armSway = Math.cos(t * 2.2) * 0.035;
      if (this.rig.leftArm) {
        this.rig.leftArm.rotation.set(-0.12 + armSway, 0, -0.28);
      }
      if (this.rig.rightArm) {
        this.rig.rightArm.rotation.set(-0.12 - armSway, 0, 0.28);
      }
      if (this.rig.leftElbow) {
        this.rig.leftElbow.rotation.set(-0.06, 0, 0);
      }
      if (this.rig.rightElbow) {
        this.rig.rightElbow.rotation.set(-0.06, 0, 0);
      }

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(0, 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(0, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(0, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(0, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(
          0,
          Math.cos(t * 0.8) * 0.03,
          Math.sin(t * 1.1) * 0.025
        );
      }
    }

    animateWalk(t) {
      const w = t * 5.2;
      const stride = Math.sin(w);

      if (this.rig.body) {
        this.rig.body.position.set(0, Math.abs(Math.sin(w)) * 0.07, 0);
        this.rig.body.rotation.set(0.04, Math.sin(w) * 0.06, Math.cos(w) * 0.03);
        this.rig.body.scale.set(1, 1, 1);
      }

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(stride * 0.42, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(Math.max(0, -stride * 0.65), 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(-stride * 0.42, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(Math.max(0, stride * 0.65), 0, 0);

      if (this.rig.leftArm) this.rig.leftArm.rotation.set(-0.12 - stride * 0.38, 0, -0.28);
      if (this.rig.leftElbow) this.rig.leftElbow.rotation.set(-0.12 - Math.max(0, -stride) * 0.32, 0, 0);
      if (this.rig.rightArm) this.rig.rightArm.rotation.set(-0.12 + stride * 0.38, 0, 0.28);
      if (this.rig.rightElbow) this.rig.rightElbow.rotation.set(-0.12 - Math.max(0, stride) * 0.32, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(0.02, -stride * 0.04, -Math.cos(w) * 0.02);
      }
    }

    animateRun(t) {
      const r = t * 8.8;
      const runStride = Math.sin(r);

      if (this.rig.body) {
        this.rig.body.position.set(0, Math.abs(Math.sin(r)) * 0.12, 0);
        this.rig.body.rotation.set(0.18, runStride * 0.08, Math.cos(r) * 0.04);
        this.rig.body.scale.set(1, 1, 1);
      }

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(runStride * 0.72, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(Math.max(0.12, -runStride * 1.05), 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(-runStride * 0.72, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(Math.max(0.12, runStride * 1.05), 0, 0);

      if (this.rig.leftArm) this.rig.leftArm.rotation.set(-0.12 - runStride * 0.65, 0, -0.22);
      if (this.rig.leftElbow) this.rig.leftElbow.rotation.set(-0.75 - runStride * 0.30, 0, 0);
      if (this.rig.rightArm) this.rig.rightArm.rotation.set(-0.12 + runStride * 0.65, 0, 0.22);
      if (this.rig.rightElbow) this.rig.rightElbow.rotation.set(-0.75 + runStride * 0.30, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(-0.14, -runStride * 0.05, 0);
      }
    }

    animateWave(t) {
      const wv = t * 7.5;

      if (this.rig.body) {
        this.rig.body.position.set(0, Math.sin(t * 3.0) * 0.04, 0);
        this.rig.body.rotation.set(0, 0.05, Math.sin(t * 3.0) * 0.03);
        this.rig.body.scale.set(1, 1, 1);
      }

      if (this.rig.leftArm) this.rig.leftArm.rotation.set(-0.12, 0, -0.28);
      if (this.rig.leftElbow) this.rig.leftElbow.rotation.set(-0.10, 0, 0);

      if (this.rig.rightArm) this.rig.rightArm.rotation.set(-1.85, 0.25, 0.52);
      if (this.rig.rightElbow) this.rig.rightElbow.rotation.set(-0.65, 0, Math.sin(wv) * 0.50);

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(0, 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(0, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(0, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(0, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(-0.06, 0.18, 0.08 + Math.sin(wv * 0.4) * 0.03);
      }
    }

    animateDance(t) {
      const d = t * 6.0;

      if (this.rig.body) {
        this.rig.body.position.set(0, Math.abs(Math.sin(d)) * 0.14, 0);
        this.rig.body.rotation.set(0, Math.sin(d * 0.5) * 0.22, Math.cos(d * 0.5) * 0.08);
        this.rig.body.scale.set(1, 1, 1);
      }

      if (this.rig.leftArm) this.rig.leftArm.rotation.set(-0.45 + Math.sin(d) * 0.35, 0, -0.45 - Math.cos(d) * 0.15);
      if (this.rig.leftElbow) this.rig.leftElbow.rotation.set(-0.75 + Math.sin(d) * 0.30, 0, 0);
      if (this.rig.rightArm) this.rig.rightArm.rotation.set(-0.45 - Math.sin(d) * 0.35, 0, 0.45 + Math.cos(d) * 0.15);
      if (this.rig.rightElbow) this.rig.rightElbow.rotation.set(-0.75 - Math.sin(d) * 0.30, 0, 0);

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(Math.sin(d) * 0.15, 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(-Math.sin(d) * 0.15, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(Math.abs(Math.cos(d)) * 0.35, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(Math.abs(Math.sin(d)) * 0.35, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(Math.sin(d * 2.0) * 0.08, 0, Math.sin(d * 0.5) * 0.10);
      }
    }

    animateCheer(t) {
      const ch = t * 4.2;
      const jump = Math.max(0, Math.sin(ch));

      if (this.rig.body) {
        this.rig.body.position.set(0, jump * 0.35, 0);
        this.rig.body.rotation.set(jump > 0.08 ? -0.05 : 0, 0, 0);
        this.rig.body.scale.set(1.0 - jump * 0.05, 1.0 + jump * 0.08, 1.0 - jump * 0.05);
      }

      const armLift = 0.65 + jump * 0.35;
      if (this.rig.leftArm) this.rig.leftArm.rotation.set(-1.85 * armLift, 0, -0.68);
      if (this.rig.leftElbow) this.rig.leftElbow.rotation.set(-0.35, 0, 0);
      if (this.rig.rightArm) this.rig.rightArm.rotation.set(-1.85 * armLift, 0, 0.68);
      if (this.rig.rightElbow) this.rig.rightElbow.rotation.set(-0.35, 0, 0);

      if (this.rig.leftLeg) this.rig.leftLeg.rotation.set(-jump * 0.35, 0, 0);
      if (this.rig.leftKnee) this.rig.leftKnee.rotation.set(jump * 0.75, 0, 0);
      if (this.rig.rightLeg) this.rig.rightLeg.rotation.set(-jump * 0.35, 0, 0);
      if (this.rig.rightKnee) this.rig.rightKnee.rotation.set(jump * 0.75, 0, 0);

      if (this.rig.head) {
        this.rig.head.rotation.set(-0.16 * armLift, 0, Math.sin(ch * 2.0) * 0.06);
      }
    }

    updateBlink(delta) {
      const bs = this.blinkSettings;

      // Handle auto-blink timer or one-shot trigger
      if (bs.autoBlink || this.triggerBlinkOnce) {
        this.blinkTimer += delta;
        const triggerThreshold = bs.interval ? (bs.interval * 0.85 + Math.sin(this.time || 0) * (bs.interval * 0.15)) : 3.8;
        if (!this.isBlinking && (this.blinkTimer > triggerThreshold || this.triggerBlinkOnce)) {
          this.isBlinking = true;
          this.blinkTimer = 0;
          this.triggerBlinkOnce = false;
        }
      }

      let dynamicBlinkAmount = 0.0;
      if (this.isBlinking) {
        const dur = bs.duration || 0.14;
        const blinkProgress = this.blinkTimer / dur;
        if (blinkProgress >= 1.0) {
          this.isBlinking = false;
          dynamicBlinkAmount = 0.0;
        } else {
          dynamicBlinkAmount = Math.sin(blinkProgress * Math.PI);
        }
      }

      // Combine dynamic blink with manual slider and mode
      let effectiveBlink = Math.max(dynamicBlinkAmount, bs.manualBlink || 0);
      if (bs.mode === 'closed') {
        effectiveBlink = 1.0;
      }

      let scaleYL = 1.0;
      let scaleYR = 1.0;

      if (bs.mode === 'left') {
        scaleYL = Math.max(0.06, 1.0 - effectiveBlink * 0.94);
      } else if (bs.mode === 'right') {
        scaleYR = Math.max(0.06, 1.0 - effectiveBlink * 0.94);
      } else {
        const s = Math.max(0.06, 1.0 - effectiveBlink * 0.94);
        scaleYL = s;
        scaleYR = s;
      }

      this.setEyeScale(scaleYL, scaleYR);
    }

    setEyeScale(scaleYL, scaleYR = scaleYL) {
      if (this.rig.leftEye) {
        this.rig.leftEye.scale.y = scaleYL;
      }
      if (this.rig.rightEye) {
        this.rig.rightEye.scale.y = scaleYR;
      }

      // Also dynamically scale ANY parts designated as eye_left or eye_right!
      if (this.rig.getPartsByFacialRole) {
        const leftParts = this.rig.getPartsByFacialRole('eye_left');
        for (const p of leftParts) {
          if (p !== this.rig.leftEye && p.userData?.isCustom) {
            const defY = p.userData.defaultTransform?.scale.y || 1;
            p.scale.y = defY * scaleYL;
          }
        }
        const rightParts = this.rig.getPartsByFacialRole('eye_right');
        for (const p of rightParts) {
          if (p !== this.rig.rightEye && p.userData?.isCustom) {
            const defY = p.userData.defaultTransform?.scale.y || 1;
            p.scale.y = defY * scaleYR;
          }
        }
      }
    }

    updateMouth(delta) {
      const ms = this.mouthSettings;
      let currentOpen = ms.open || 0;

      // Auto-talk oscillation
      if (ms.autoTalk) {
        this.talkTimer += delta * 10.0;
        const speechWave = (Math.sin(this.talkTimer) * 0.5 + 0.5) * 0.75 + (Math.sin(this.talkTimer * 2.3) * 0.25);
        currentOpen = Math.max(currentOpen, Math.max(0, speechWave));
      }

      if (this.rig.mouthGroup) {
        this.rig.mouthGroup.scale.x = ms.width !== undefined ? ms.width : 1.0;
        this.rig.mouthGroup.scale.y = 1.0 + currentOpen * 0.85;
        this.rig.mouthGroup.position.y = -currentOpen * 0.08;

        // Curve modulation: tilt or arch
        if (ms.curve !== undefined) {
          this.rig.mouthGroup.rotation.z = (ms.curve - 0.5) * 0.25;
        }
      }

      // Also scale any custom parts designated as mouth
      if (this.rig.getPartsByFacialRole) {
        const mouthParts = this.rig.getPartsByFacialRole('mouth');
        for (const mp of mouthParts) {
          if (mp.userData?.isCustom) {
            const defY = mp.userData.defaultTransform?.scale.y || 1;
            const defX = mp.userData.defaultTransform?.scale.x || 1;
            mp.scale.y = defY * (1.0 + currentOpen * 0.85);
            mp.scale.x = defX * (ms.width !== undefined ? ms.width : 1.0);
          }
        }
      }
    }

    resetPose() {
      if (this.rig.body) {
        this.rig.body.position.set(0, 0, 0);
        this.rig.body.rotation.set(0, 0, 0);
        this.rig.body.scale.set(1, 1, 1);
      }
      if (this.rig.head) {
        this.rig.head.rotation.set(0, 0, 0);
      }
      if (this.rig.leftArm) {
        this.rig.leftArm.rotation.set(-0.12, 0, -0.28);
      }
      if (this.rig.rightArm) {
        this.rig.rightArm.rotation.set(-0.12, 0, 0.28);
      }
      if (this.rig.leftElbow) {
        this.rig.leftElbow.rotation.set(0, 0, 0);
      }
      if (this.rig.rightElbow) {
        this.rig.rightElbow.rotation.set(0, 0, 0);
      }
      if (this.rig.leftLeg) {
        this.rig.leftLeg.rotation.set(0, 0, 0);
      }
      if (this.rig.rightLeg) {
        this.rig.rightLeg.rotation.set(0, 0, 0);
      }
      if (this.rig.leftKnee) {
        this.rig.leftKnee.rotation.set(0, 0, 0);
      }
      if (this.rig.rightKnee) {
        this.rig.rightKnee.rotation.set(0, 0, 0);
      }
      this.setEyeScale(1.0);
    }
  }

  return {
    PALETTE: PALETTE,
    build: buildCharacter,
    Animator: CharacterAnimator
  };
});
