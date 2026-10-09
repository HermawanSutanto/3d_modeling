/* ==========================================================================
   APP.JS - Three.js Studio Scene, Controls, Lighting & UI Interaction
   ========================================================================== */

(function () {
  'use strict';

  // --- STATE ---
  let scene, camera, renderer, controls;
  let characterRig, characterAnimator;
  let keyLight, fillLight, rimLight, ambientLight;
  let isAutoRotate = false;
  let isWireframe = false;
  let clock;

  // Camera Target (Centered on character core)
  const TARGET_POS = new THREE.Vector3(0, 4.4, 0);

  // --- INIT APPLICATION ---
  function init() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    clock = new THREE.Clock();

    // 1. SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    // 2. CAMERA (Spec: telephoto/portrait FOV 34 to prevent wide-angle distortion)
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 100);
    camera.position.set(3.8, 4.6, 17.0);
    window.appCamera = camera;

    // 3. RENDERER (Studio Quality)
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    if (renderer.outputEncoding !== undefined && THREE.sRGBEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    } else if (renderer.outputColorSpace !== undefined && THREE.SRGBColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.localClippingEnabled = true;
    window.appRenderer = renderer;
    container.appendChild(renderer.domElement);

    // 4. CONTROLS (Smooth OrbitControls)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    window.appControls = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(TARGET_POS);
    controls.minDistance = 4;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // Limit below ground

    // 5. LIGHTING SETUP (Spec Section 13: Neutral Studio Lighting)
    setupLighting();

    // 6. BUILD CHARACTER
    buildModel();

    // 7. SETUP EVENT LISTENERS & UI
    setupUI();
    window.addEventListener('resize', onWindowResize, false);

    // 8. ANIMATION LOOP
    animate();
  }

  // --- STUDIO LIGHTING ---
  function setupLighting() {
    // Ambient / Environment Fill
    ambientLight = new THREE.AmbientLight(0xffffff, 0.40);
    scene.add(ambientLight);

    // Key Light (Large soft directional light from front-top-right)
    keyLight = new THREE.DirectionalLight(0xfff8ee, 0.85);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 3.5; // Soft shadow edges
    scene.add(keyLight);

    // Fill Light (Gentle cool fill from front-left)
    fillLight = new THREE.DirectionalLight(0xdbeafe, 0.35);
    fillLight.position.set(-7, 6, 6);
    scene.add(fillLight);

    // Rim / Hair Light (Highlights silhouette from back-top)
    rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    rimLight.position.set(0, 10, -8);
    scene.add(rimLight);

    // Soft ground bounce light
    const bounceLight = new THREE.DirectionalLight(0xfef08a, 0.08);
    bounceLight.position.set(0, -6, 2);
    scene.add(bounceLight);
  }

  // --- BUILD & PLACE MODEL ---
  function buildModel() {
    if (!window.CharacterModel) {
      console.error('CharacterModel generator not found');
      return;
    }

    characterRig = window.CharacterModel.build();
    scene.add(characterRig.root);

    characterAnimator = characterRig.animator || new window.CharacterModel.Animator(characterRig);
    characterRig.animator = characterAnimator;
    window.appRig = characterRig;
    window.appAnimator = characterAnimator;

    // Initialize in-browser Character Editor if loaded
    if (window.CharacterEditor && typeof window.CharacterEditor.init === 'function') {
      window.CharacterEditor.init(characterRig);
    }
  }

  // --- LIGHTING PRESETS ---
  function setLightingPreset(preset) {
    if (preset === 'studio') {
      scene.background.set(0xf1f5f9);
      ambientLight.color.set(0xffffff);
      ambientLight.intensity = 0.40;
      keyLight.color.set(0xfff8ee);
      keyLight.intensity = 0.85;
      fillLight.color.set(0xdbeafe);
      fillLight.intensity = 0.35;
      rimLight.color.set(0xffffff);
      rimLight.intensity = 0.45;
    } else if (preset === 'warm') {
      scene.background.set(0xfef3c7);
      ambientLight.color.set(0xfde68a);
      ambientLight.intensity = 0.45;
      keyLight.color.set(0xffedd5);
      keyLight.intensity = 0.95;
      fillLight.color.set(0xfb923c);
      fillLight.intensity = 0.30;
      rimLight.color.set(0xfef08a);
      rimLight.intensity = 0.50;
    } else if (preset === 'island') {
      scene.background.set(0xe0f2fe);
      ambientLight.color.set(0xbae6fd);
      ambientLight.intensity = 0.48;
      keyLight.color.set(0xffffff);
      keyLight.intensity = 0.90;
      fillLight.color.set(0x7dd3fc);
      fillLight.intensity = 0.38;
      rimLight.color.set(0x38bdf8);
      rimLight.intensity = 0.45;
    }
  }

  // --- CAMERA PRESET VIEWS ---
  function setCameraView(view) {
    controls.target.copy(TARGET_POS);

    switch (view) {
      case 'perspective': // 3/4 Perspective (Spec default)
        camera.position.set(3.8, 4.6, 17.0);
        break;
      case 'front': // Straight front view
        camera.position.set(0, 4.6, 17.0);
        break;
      case 'side': // Profile view
        camera.position.set(17.0, 4.6, 0);
        break;
      case 'back': // Rear view (hair bowl cut inspect)
        camera.position.set(0, 4.6, -17.0);
        break;
      case 'face': // Face and expression close-up
        controls.target.set(0, 6.9, 0);
        camera.position.set(0.0, 7.0, 5.6);
        break;
    }
    controls.update();
  }

  // --- WIREFRAME TOGGLE ---
  function toggleWireframe() {
    isWireframe = !isWireframe;
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = isWireframe));
        } else {
          child.material.wireframe = isWireframe;
        }
      }
    });
    return isWireframe;
  }

  // --- TAKE SCREENSHOT ---
  function takeScreenshot() {
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'animal_crossing_villager_3d.png';
    a.click();
  }

  // --- UI CONTROLS WIRING ---
  function setupUI() {
    // Camera View Buttons
    document.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        setCameraView(btn.getAttribute('data-view'));
      });
    });

    // Animation Play/Pause Toggle
    const animBtn = document.getElementById('btn-anim');
    if (animBtn && characterAnimator) {
      animBtn.addEventListener('click', () => {
        const isPaused = !characterAnimator.isPaused;
        characterAnimator.setPaused(isPaused);
        if (isPaused) {
          animBtn.classList.remove('active');
          animBtn.innerHTML = '<span>▶️</span> Lanjut Gerak';
        } else {
          animBtn.classList.add('active');
          animBtn.innerHTML = '<span>⏸️</span> Jeda Gerak';
        }
      });
    }

    // Auto Rotate
    const rotateBtn = document.getElementById('btn-rotate');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        isAutoRotate = !isAutoRotate;
        rotateBtn.classList.toggle('active', isAutoRotate);
      });
    }

    // Wireframe Mode
    const wireframeBtn = document.getElementById('btn-wireframe');
    if (wireframeBtn) {
      wireframeBtn.addEventListener('click', () => {
        const active = toggleWireframe();
        wireframeBtn.classList.toggle('active', active);
      });
    }

    // Skeleton Mode
    const skeletonBtn = document.getElementById('btn-skeleton');
    if (skeletonBtn) {
      skeletonBtn.addEventListener('click', () => {
        if (!characterRig || !characterRig.setSkeletonVisibility) return;
        const isVis = !characterRig.getSkeletonVisibility();
        characterRig.setSkeletonVisibility(isVis);
        skeletonBtn.classList.toggle('active', isVis);
        const drawerSkelBtn = document.getElementById('btn-toggle-skeleton');
        const drawerSkelText = document.getElementById('skeleton-toggle-text');
        if (drawerSkelBtn) drawerSkelBtn.classList.toggle('active', isVis);
        if (drawerSkelText) drawerSkelText.textContent = isVis ? 'Sembunyikan Sendi & Skeleton' : 'Tampilkan Sendi & Skeleton';
      });
    }

    // Facial Markers Mode
    const facialMarkersBtn = document.getElementById('btn-facial-markers');
    if (facialMarkersBtn) {
      facialMarkersBtn.addEventListener('click', () => {
        if (!characterRig || !characterRig.setFacialMarkersVisibility) return;
        const isVis = !characterRig.getFacialMarkersVisibility();
        characterRig.setFacialMarkersVisibility(isVis);
        facialMarkersBtn.classList.toggle('active', isVis);
        const switchInDrawer = document.getElementById('toggle-facial-markers-switch');
        if (switchInDrawer) switchInDrawer.checked = isVis;
      });
    }

    // Lighting Presets
    document.querySelectorAll('[data-lighting]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-lighting]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        setLightingPreset(btn.getAttribute('data-lighting'));
      });
    });

    // Reset Camera
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.querySelectorAll('[data-view]').forEach((b) => b.classList.remove('active'));
        const defaultView = document.querySelector('[data-view="perspective"]');
        if (defaultView) defaultView.classList.add('active');
        setCameraView('perspective');
      });
    }

    // Screenshot
    const snapBtn = document.getElementById('btn-screenshot');
    if (snapBtn) {
      snapBtn.addEventListener('click', takeScreenshot);
    }

    // Spec Drawer Toggle
    const specToggle = document.getElementById('btn-spec');
    const specDrawer = document.getElementById('spec-drawer');
    const specClose = document.getElementById('btn-close-spec');
    if (specToggle && specDrawer) {
      specToggle.addEventListener('click', () => {
        specDrawer.classList.toggle('open');
      });
    }
    if (specClose && specDrawer) {
      specClose.addEventListener('click', () => {
        specDrawer.classList.remove('open');
      });
    }

    // 3D Raycasting Interactive Selection
    setupRaycasting();
  }

  // --- 3D INTERACTIVE RAYCASTING ---
  function setupRaycasting() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downX = 0, downY = 0;

    renderer.domElement.addEventListener('pointerdown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });

    renderer.domElement.addEventListener('pointerup', (e) => {
      // Ignore if dragging/orbiting
      if (Math.abs(e.clientX - downX) > 6 || Math.abs(e.clientY - downY) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (characterRig && characterRig.root) {
        const hits = raycaster.intersectObjects(characterRig.root.children, true);
        let hitMesh = null;
        for (const hit of hits) {
          if (hit.object.isMesh &&
              hit.object !== characterRig.selectionBox &&
              hit.object.userData &&
              hit.object.userData.partId) {
            hitMesh = hit.object;
            break;
          }
        }
        if (hitMesh && window.CharacterEditor && typeof window.CharacterEditor.selectPart === 'function') {
          window.CharacterEditor.selectPart(hitMesh.userData.partId);
        }
      }
    });
  }

  // --- WINDOW RESIZE ---
  function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // --- RENDER LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update Animator
    if (characterAnimator) {
      characterAnimator.update(delta);
    }

    // Auto rotate around target
    if (isAutoRotate && characterRig) {
      characterRig.root.rotation.y += delta * 0.45;
    }

    // Controls update for damping
    controls.update();

    // Keep selection box in sync with animated breathing character
    if (characterRig && characterRig.selectedPartId && characterRig.selectionBox && characterRig.selectionBox.visible) {
      characterRig.selectionBox.update();
    }

    renderer.render(scene, camera);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
