/* ==========================================================================
   EDITOR.JS - Modular 3D Hierarchy & Part Editor with Real-Time Inspector
   ========================================================================== */

(function () {
  'use strict';

  let currentRig = null;
  let selectedPartId = null;
  let isUniformScale = true;

  // Master Default Configuration
  const DEFAULT_CONFIG = {
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

  const BONE_CATEGORIES = {
    head: { name: '🧠 Kepala & Wajah (Head Bone)', icon: '🧠' },
    torso: { name: '👕 Badan & Baju (Torso Bone)', icon: '👕' },
    pelvis: { name: '🩳 Panggul & Pinggang (Pelvis Bone)', icon: '🩳' },
    arm_upper_l: { name: '🦾 Lengan Atas Kiri (Left Upper Arm)', icon: '🦾' },
    arm_lower_l: { name: '✋ Siku & Tangan Kiri (Left Forearm)', icon: '✋' },
    arm_upper_r: { name: '🦾 Lengan Atas Kanan (Right Upper Arm)', icon: '🦾' },
    arm_lower_r: { name: '✋ Siku & Tangan Kanan (Right Forearm)', icon: '✋' },
    leg_upper_l: { name: '🦵 Paha & Cuff Kiri (Left Thigh Bone)', icon: '🦵' },
    leg_lower_l: { name: '👟 Lutut & Kaki Kiri (Left Knee Bone)', icon: '👟' },
    leg_upper_r: { name: '🦵 Paha & Cuff Kanan (Right Thigh Bone)', icon: '🦵' },
    leg_lower_r: { name: '👟 Lutut & Kaki Kanan (Right Knee Bone)', icon: '👟' },
    custom: { name: '⭐ Part Kustom (Custom)', icon: '⭐' }
  };

  function init(rig) {
    currentRig = rig;
    if (!currentRig) return;

    setupTabs();
    setupOutlinerTree();
    setupInspectorControls();
    setupPartCreator();
    setupColorControls();
    setupBadgeControls();
    setupProportionControls();
    setupStyleAndFaceControls();
    setupPresetControls();
    setupImportExport();
    setupMotionAndPoseControls();
    setupFaceAndBlinkControls();
    setupDrawerToggle();

    // Sync initial state from rig
    const initialConfig = currentRig.getConfig ? currentRig.getConfig() : DEFAULT_CONFIG;
    syncUIToConfig(initialConfig);
    refreshOutlinerTree();
  }

  // --- DRAWER TOGGLE & CLOSE ---
  function setupDrawerToggle() {
    const btnEditor = document.getElementById('btn-editor');
    const drawer = document.getElementById('editor-drawer');
    const btnClose = document.getElementById('btn-close-editor');

    if (btnEditor && drawer) {
      btnEditor.addEventListener('click', () => {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
          drawer.classList.remove('open');
          btnEditor.classList.remove('active');
        } else {
          drawer.classList.add('open');
          btnEditor.classList.add('active');
          const specDrawer = document.getElementById('spec-drawer');
          if (specDrawer) specDrawer.classList.remove('open');
          const btnSpec = document.getElementById('btn-spec');
          if (btnSpec) btnSpec.classList.remove('active');
          refreshOutlinerTree();
        }
      });
    }

    if (btnClose && drawer) {
      btnClose.addEventListener('click', () => {
        drawer.classList.remove('open');
        if (btnEditor) btnEditor.classList.remove('active');
      });
    }
  }

  // --- TABS SYSTEM ---
  function setupTabs() {
    const tabButtons = document.querySelectorAll('.editor-tab-btn');
    const tabPanels = document.querySelectorAll('.editor-tab-panel');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(targetTab) {
    const tabButtons = document.querySelectorAll('.editor-tab-btn');
    const tabPanels = document.querySelectorAll('.editor-tab-panel');

    tabButtons.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetTab);
    });
    tabPanels.forEach((p) => {
      p.classList.toggle('active', p.id === `tab-${targetTab}`);
    });

    if (targetTab === 'tree') {
      refreshOutlinerTree();
    }
  }

  // =========================================================================
  // 1. OUTLINER HIERARCHY TREE
  // =========================================================================
  function setupOutlinerTree() {
    const btnAddPartHeader = document.getElementById('btn-tree-add-part');
    if (btnAddPartHeader) {
      btnAddPartHeader.addEventListener('click', () => {
        switchTab('addpart');
      });
    }
  }

  function refreshOutlinerTree() {
    const treeContainer = document.getElementById('outliner-tree-container');
    if (!treeContainer || !currentRig || !currentRig.getObjectList) return;

    const parts = currentRig.getObjectList();
    treeContainer.innerHTML = '';

    // Group items by skeleton bone
    const groups = {};
    for (const key of Object.keys(BONE_CATEGORIES)) {
      groups[key] = [];
    }

    parts.forEach((p) => {
      let bId = p.boneId || p.category;
      if (['hair', 'face', 'ears', 'head'].includes(bId)) bId = 'head';
      else if (bId === 'arms') bId = 'arm_upper_l';
      else if (bId === 'legs') bId = 'leg_upper_l';

      if (!groups[bId]) {
        bId = p.isCustom ? 'custom' : 'head';
      }
      groups[bId].push(p);
    });

    for (const [catKey, catItems] of Object.entries(groups)) {
      if (catItems.length === 0 && catKey !== 'custom') continue;

      const boneDef = BONE_CATEGORIES[catKey] || { name: catKey, icon: '🦴' };
      const groupHeader = document.createElement('div');
      groupHeader.className = 'tree-group-node open';

      const groupTitle = document.createElement('div');
      groupTitle.className = 'tree-group-header';
      groupTitle.innerHTML = `
        <span class="tree-arrow">▼</span>
        <span class="tree-group-title">${boneDef.name}</span>
        <span class="tree-group-count">${catItems.length}</span>
      `;

      const groupChildren = document.createElement('div');
      groupChildren.className = 'tree-group-children';

      groupTitle.addEventListener('click', () => {
        groupHeader.classList.toggle('open');
        const arrow = groupTitle.querySelector('.tree-arrow');
        if (arrow) arrow.textContent = groupHeader.classList.contains('open') ? '▼' : '▶';
      });

      catItems.forEach((item) => {
        const itemNode = document.createElement('div');
        itemNode.className = `tree-item-node ${item.id === selectedPartId ? 'selected' : ''}`;
        itemNode.setAttribute('data-part-id', item.id);

        let icon = '🔷';
        if (item.geomType === 'cone') icon = '🔺';
        else if (item.geomType === 'sphere') icon = '⚪';
        else if (item.geomType === 'cylinder') icon = '🥫';
        else if (item.geomType === 'box') icon = '📦';
        else if (item.geomType === 'torus') icon = '🍩';

        let roleBadge = '';
        if (item.facialRole === 'eye_left') roleBadge = '<span class="tree-role-pill eye">👁️L</span>';
        else if (item.facialRole === 'eye_right') roleBadge = '<span class="tree-role-pill eye">👁️R</span>';
        else if (item.facialRole === 'mouth') roleBadge = '<span class="tree-role-pill mouth">👄Mulut</span>';
        else if (item.facialRole === 'nose') roleBadge = '<span class="tree-role-pill nose">👃Hidung</span>';
        else if (item.facialRole === 'eyebrow_left') roleBadge = '<span class="tree-role-pill eyebrow">🤨Alis L</span>';
        else if (item.facialRole === 'eyebrow_right') roleBadge = '<span class="tree-role-pill eyebrow">🤨Alis R</span>';

        itemNode.innerHTML = `
          <div class="tree-item-label">
            <span class="tree-item-icon">${icon}</span>
            <span class="tree-item-name" title="${item.name}">${item.name}</span>
            ${roleBadge}
          </div>
          <div class="tree-item-actions">
            <button class="tree-btn-vis ${item.visible ? '' : 'hidden'}" title="Tampilkan/Sembunyikan">
              ${item.visible ? '👁️' : '🚫'}
            </button>
          </div>
        `;

        // Click to select
        itemNode.addEventListener('click', (e) => {
          if (e.target.closest('.tree-btn-vis')) return;
          selectPart(item.id);
          switchTab('inspector');
        });

        // Toggle visibility
        const visBtn = itemNode.querySelector('.tree-btn-vis');
        if (visBtn) {
          visBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newVis = !item.visible;
            currentRig.setObjectVisibility(item.id, newVis);
            refreshOutlinerTree();
          });
        }

        groupChildren.appendChild(itemNode);
      });

      groupHeader.appendChild(groupTitle);
      groupHeader.appendChild(groupChildren);
      treeContainer.appendChild(groupHeader);
    }

    updateFacialStatusUI();
  }

  // =========================================================================
  // 2. INSPECTOR PANEL (TRANSFORM & MATERIAL)
  // =========================================================================
  function setupInspectorControls() {
    // Uniform Scale Toggle
    const toggleUniform = document.getElementById('toggle-uniform-scale');
    if (toggleUniform) {
      toggleUniform.addEventListener('change', () => {
        isUniformScale = toggleUniform.checked;
      });
    }

    // Name input
    const inputName = document.getElementById('insp-part-name');
    if (inputName) {
      inputName.addEventListener('change', () => {
        if (!selectedPartId || !currentRig) return;
        const mesh = currentRig.registeredParts.get(selectedPartId);
        if (mesh) {
          mesh.name = inputName.value;
          refreshOutlinerTree();
        }
      });
    }

    // Parent bone dropdown (Reparenting)
    const selectParent = document.getElementById('insp-part-parent');
    if (selectParent) {
      selectParent.addEventListener('change', () => {
        if (!selectedPartId || !currentRig) return;
        currentRig.reparentObject(selectedPartId, selectParent.value);
        refreshOutlinerTree();
        const boneLabel = selectParent.options[selectParent.selectedIndex]?.text || selectParent.value;
        showToast(`Objek ditempelkan ke ${boneLabel}!`);
      });
    }

    // Facial Role dropdown (Eye/Mouth Role Switch)
    const selectFacialRole = document.getElementById('insp-facial-role');
    if (selectFacialRole) {
      selectFacialRole.addEventListener('change', () => {
        if (!selectedPartId || !currentRig) return;
        const role = selectFacialRole.value;
        if (currentRig.setFacialRole) {
          currentRig.setFacialRole(selectedPartId, role);
        }
        refreshOutlinerTree();
        updateFacialStatusUI();
        const roleLabel = selectFacialRole.options[selectFacialRole.selectedIndex]?.text || role;
        showToast(`Peran wajah objek diatur ke: ${roleLabel}!`);
      });
    }

    // Transform bindings (Position, Rotation, Scale)
    setupTransformBinding('pos-x', (val) => currentRig.updateObjectTransform(selectedPartId, { position: { x: val } }));
    setupTransformBinding('pos-y', (val) => currentRig.updateObjectTransform(selectedPartId, { position: { y: val } }));
    setupTransformBinding('pos-z', (val) => currentRig.updateObjectTransform(selectedPartId, { position: { z: val } }));

    setupTransformBinding('rot-x', (val) => currentRig.updateObjectTransform(selectedPartId, { rotation: { x: val } }));
    setupTransformBinding('rot-y', (val) => currentRig.updateObjectTransform(selectedPartId, { rotation: { y: val } }));
    setupTransformBinding('rot-z', (val) => currentRig.updateObjectTransform(selectedPartId, { rotation: { z: val } }));

    setupScaleBinding('scl-x', 'x');
    setupScaleBinding('scl-y', 'y');
    setupScaleBinding('scl-z', 'z');

    // Material Color & Roughness
    const inputColor = document.getElementById('insp-part-color');
    const spanHex = document.getElementById('insp-hex-color');
    if (inputColor) {
      const handleColor = () => {
        if (!selectedPartId || !currentRig) return;
        currentRig.updateObjectMaterial(selectedPartId, { color: inputColor.value });
        if (spanHex) spanHex.textContent = inputColor.value.toUpperCase();
      };
      inputColor.addEventListener('input', handleColor);
      inputColor.addEventListener('change', handleColor);
    }

    const sliderRough = document.getElementById('insp-part-rough');
    const badgeRough = document.getElementById('insp-val-rough');
    if (sliderRough) {
      sliderRough.addEventListener('input', () => {
        if (!selectedPartId || !currentRig) return;
        const r = parseFloat(sliderRough.value);
        currentRig.updateObjectMaterial(selectedPartId, { roughness: r });
        if (badgeRough) badgeRough.textContent = r.toFixed(2);
      });
    }

    // Quick Actions
    const btnResetTransform = document.getElementById('btn-insp-reset-tf');
    if (btnResetTransform) {
      btnResetTransform.addEventListener('click', () => {
        if (!selectedPartId || !currentRig) return;
        currentRig.resetObjectTransform(selectedPartId);
        populateInspector(selectedPartId);
        showToast('Transformasi objek direset!');
      });
    }

    const btnDuplicate = document.getElementById('btn-insp-duplicate');
    if (btnDuplicate) {
      btnDuplicate.addEventListener('click', () => {
        if (!selectedPartId || !currentRig) return;
        const newId = currentRig.duplicateObject(selectedPartId, false);
        if (newId) {
          selectPart(newId);
          refreshOutlinerTree();
          showToast('Objek berhasil diduplikasi!');
        }
      });
    }

    const btnMirror = document.getElementById('btn-insp-mirror');
    if (btnMirror) {
      btnMirror.addEventListener('click', () => {
        if (!selectedPartId || !currentRig) return;
        const newId = currentRig.duplicateObject(selectedPartId, true);
        if (newId) {
          selectPart(newId);
          refreshOutlinerTree();
          showToast('Objek dicerminkan ke sisi simetris (-X)!');
        }
      });
    }

    const btnDelete = document.getElementById('btn-insp-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        if (!selectedPartId || !currentRig) return;
        const deleted = currentRig.deleteObject(selectedPartId);
        if (deleted) {
          showToast('Objek berhasil dihapus!');
          selectedPartId = null;
          populateInspector(null);
          refreshOutlinerTree();
          switchTab('tree');
        } else {
          alert('Objek sistem dasar tidak dapat dihapus.');
        }
      });
    }
  }

  function setupTransformBinding(idPrefix, updateFn) {
    const slider = document.getElementById(`slider-${idPrefix}`);
    const numInput = document.getElementById(`num-${idPrefix}`);

    if (slider && numInput) {
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        numInput.value = val;
        if (selectedPartId && currentRig) updateFn(val);
      });
      numInput.addEventListener('change', () => {
        const val = parseFloat(numInput.value);
        slider.value = val;
        if (selectedPartId && currentRig) updateFn(val);
      });
    }
  }

  function setupScaleBinding(idPrefix, axis) {
    const slider = document.getElementById(`slider-${idPrefix}`);
    const numInput = document.getElementById(`num-${idPrefix}`);

    if (slider && numInput) {
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        numInput.value = val;
        applyScaleChange(axis, val);
      });
      numInput.addEventListener('change', () => {
        const val = parseFloat(numInput.value);
        slider.value = val;
        applyScaleChange(axis, val);
      });
    }
  }

  function applyScaleChange(axis, val) {
    if (!selectedPartId || !currentRig) return;
    if (isUniformScale) {
      ['x', 'y', 'z'].forEach((ax) => {
        const sl = document.getElementById(`slider-scl-${ax}`);
        const nm = document.getElementById(`num-scl-${ax}`);
        if (sl) sl.value = val;
        if (nm) nm.value = val;
      });
      currentRig.updateObjectTransform(selectedPartId, {
        scale: { x: val, y: val, z: val }
      });
    } else {
      currentRig.updateObjectTransform(selectedPartId, {
        scale: { [axis]: val }
      });
    }
  }

  function selectPart(partId) {
    selectedPartId = partId;
    if (currentRig && currentRig.selectObject) {
      currentRig.selectObject(partId);
    }
    populateInspector(partId);

    // Update active highlight in tree
    document.querySelectorAll('.tree-item-node').forEach((node) => {
      node.classList.toggle('selected', node.getAttribute('data-part-id') === partId);
    });
  }

  function populateInspector(partId) {
    const emptyState = document.getElementById('inspector-empty-state');
    const contentState = document.getElementById('inspector-content-state');

    if (!partId || !currentRig) {
      if (emptyState) emptyState.style.display = 'block';
      if (contentState) contentState.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (contentState) contentState.style.display = 'flex';

    const parts = currentRig.getObjectList ? currentRig.getObjectList() : [];
    const item = parts.find((p) => p.id === partId);
    if (!item) return;

    // Name & Type
    const inputName = document.getElementById('insp-part-name');
    const badgeType = document.getElementById('insp-part-type');
    const selectParent = document.getElementById('insp-part-parent');

    if (inputName) inputName.value = item.name;
    if (badgeType) badgeType.textContent = item.geomType.toUpperCase();
    if (selectParent) {
      let bVal = item.boneId || item.category;
      if (['hair', 'face', 'ears'].includes(bVal)) bVal = 'head';
      else if (bVal === 'arms') bVal = 'arm_upper_l';
      else if (bVal === 'legs') bVal = 'leg_upper_l';
      selectParent.value = bVal;
    }
    const selectRole = document.getElementById('insp-facial-role');
    if (selectRole) {
      selectRole.value = item.facialRole || 'none';
    }

    // Helper to sync slider & number
    const syncPair = (idPrefix, val) => {
      const sl = document.getElementById(`slider-${idPrefix}`);
      const nm = document.getElementById(`num-${idPrefix}`);
      if (sl) sl.value = val;
      if (nm) nm.value = val;
    };

    // Position
    syncPair('pos-x', item.position.x);
    syncPair('pos-y', item.position.y);
    syncPair('pos-z', item.position.z);

    // Rotation
    syncPair('rot-x', item.rotation.x);
    syncPair('rot-y', item.rotation.y);
    syncPair('rot-z', item.rotation.z);

    // Scale
    syncPair('scl-x', item.scale.x);
    syncPair('scl-y', item.scale.y);
    syncPair('scl-z', item.scale.z);

    // Material
    const inputColor = document.getElementById('insp-part-color');
    const spanHex = document.getElementById('insp-hex-color');
    const sliderRough = document.getElementById('insp-part-rough');
    const badgeRough = document.getElementById('insp-val-rough');

    if (inputColor) inputColor.value = item.color;
    if (spanHex) spanHex.textContent = String(item.color).toUpperCase();
    if (sliderRough) sliderRough.value = item.roughness;
    if (badgeRough) badgeRough.textContent = Number(item.roughness).toFixed(2);
  }

  // =========================================================================
  // 3. PART CREATOR
  // =========================================================================
  function setupPartCreator() {
    let currentShape = 'cone';

    // Shape choice buttons
    const shapeButtons = document.querySelectorAll('.shape-choice-btn');
    shapeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        shapeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentShape = btn.getAttribute('data-shape') || 'cone';
      });
    });

    // Preset Position buttons
    document.querySelectorAll('.preset-pos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const posX = parseFloat(btn.getAttribute('data-px') || 0);
        const posY = parseFloat(btn.getAttribute('data-py') || 0);
        const posZ = parseFloat(btn.getAttribute('data-pz') || 0);
        const inputX = document.getElementById('add-pos-x');
        const inputY = document.getElementById('add-pos-y');
        const inputZ = document.getElementById('add-pos-z');
        if (inputX) inputX.value = posX;
        if (inputY) inputY.value = posY;
        if (inputZ) inputZ.value = posZ;
      });
    });

    // Add Part Button
    const btnAddPart = document.getElementById('btn-add-part-confirm');
    if (btnAddPart) {
      btnAddPart.addEventListener('click', () => {
        if (!currentRig || !currentRig.addPrimitivePart) return;

        const inputName = document.getElementById('add-part-name');
        const selectParent = document.getElementById('add-part-parent');
        const inputColor = document.getElementById('add-part-color');
        const inputX = document.getElementById('add-pos-x');
        const inputY = document.getElementById('add-pos-y');
        const inputZ = document.getElementById('add-pos-z');

        const name = (inputName && inputName.value.trim()) || `Custom_${currentShape.toUpperCase()}`;
        const parentCategory = (selectParent && selectParent.value) || 'hair';
        const color = (inputColor && inputColor.value) || '#1e0f08';
        const px = inputX ? parseFloat(inputX.value) || 0 : 0;
        const py = inputY ? parseFloat(inputY.value) || 0 : 0.2;
        const pz = inputZ ? parseFloat(inputZ.value) || 0 : 1.4;

        const newId = currentRig.addPrimitivePart({
          type: currentShape,
          name: name,
          parentGroupId: parentCategory,
          color: color,
          position: { x: px, y: py, z: pz },
          scale: { x: 1, y: 1, z: 1 }
        });

        if (newId) {
          refreshOutlinerTree();
          selectPart(newId);
          switchTab('inspector');
          showToast(`Objek "${name}" (${currentShape}) berhasil dibuat!`);
        }
      });
    }
  }

  // =========================================================================
  // 4. COLOR, BADGE & PROPORTION CONTROLS (GLOBAL PRESETS)
  // =========================================================================
  function setupColorControls() {
    const colorKeys = [
      'skin', 'hair', 'shirt', 'shorts', 'shoes', 'sole', 'sock', 'eyes', 'cheeks', 'badgeBg', 'badgeText'
    ];

    colorKeys.forEach((key) => {
      const input = document.getElementById(`color-${key}`);
      const hexSpan = document.getElementById(`hex-${key}`);

      if (input) {
        const handleColorChange = () => {
          const val = input.value;
          if (hexSpan) hexSpan.textContent = val.toUpperCase();
          if (key === 'badgeBg' || key === 'badgeText') {
            currentRig.updateBadge({
              bgColor: key === 'badgeBg' ? val : undefined,
              textColor: key === 'badgeText' ? val : undefined
            });
          } else {
            currentRig.updateColors({ [key]: val });
          }
        };

        input.addEventListener('input', handleColorChange);
        input.addEventListener('change', handleColorChange);
      }
    });

    document.querySelectorAll('.swatch-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetKey = pill.getAttribute('data-color-target');
        const colorVal = pill.getAttribute('data-color-val');
        if (!targetKey || !colorVal) return;

        const input = document.getElementById(`color-${targetKey}`);
        if (input) {
          input.value = colorVal;
          input.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  function setupBadgeControls() {
    const inputBadgeText = document.getElementById('input-badge-text');
    const selectBadgeShape = document.getElementById('select-badge-shape');

    if (inputBadgeText) {
      inputBadgeText.addEventListener('input', () => {
        currentRig.updateBadge({ text: inputBadgeText.value });
      });
    }

    if (selectBadgeShape) {
      selectBadgeShape.addEventListener('change', () => {
        currentRig.updateBadge({ shape: selectBadgeShape.value });
      });
    }

    document.querySelectorAll('.badge-quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sym = btn.getAttribute('data-symbol');
        if (inputBadgeText) {
          inputBadgeText.value = sym;
          currentRig.updateBadge({ text: sym });
        }
      });
    });
  }

  function setupProportionControls() {
    const sliders = [
      { id: 'slider-head-x', prop: 'headScaleX', badgeId: 'val-head-x' },
      { id: 'slider-head-y', prop: 'headScaleY', badgeId: 'val-head-y' },
      { id: 'slider-ear-scale', prop: 'earScale', badgeId: 'val-ear-scale' },
      { id: 'slider-body-chubby', prop: 'bodyChubby', badgeId: 'val-body-chubby' },
      { id: 'slider-arm-angle', prop: 'armAngle', badgeId: 'val-arm-angle' }
    ];

    sliders.forEach((s) => {
      const el = document.getElementById(s.id);
      const badge = document.getElementById(s.badgeId);

      if (el) {
        el.addEventListener('input', () => {
          const val = parseFloat(el.value);
          if (badge) badge.textContent = val.toFixed(2) + '×';
          currentRig.updateProportions({ [s.prop]: val });
        });
      }
    });
  }

  function setupStyleAndFaceControls() {
    const hairBtns = document.querySelectorAll('.hair-btn');
    hairBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        hairBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const style = btn.getAttribute('data-style');
        currentRig.updateHairStyle(style);
        refreshOutlinerTree();
      });
    });

    const mouthBtns = document.querySelectorAll('.mouth-btn');
    mouthBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        mouthBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mouth = btn.getAttribute('data-mouth');
        currentRig.updateExpression({ mouth: mouth });
      });
    });

    const eyeBtns = document.querySelectorAll('.eye-btn');
    eyeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        eyeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const eye = btn.getAttribute('data-eye');
        currentRig.updateExpression({ eyeStyle: eye });
      });
    });

    const toggleBlush = document.getElementById('toggle-blush');
    if (toggleBlush) {
      toggleBlush.addEventListener('change', () => {
        currentRig.updateExpression({ blush: toggleBlush.checked });
      });
    }
  }

  // =========================================================================
  // 5. PRESETS & EXPORT
  // =========================================================================
  function setupPresetControls() {
    const btnRandomize = document.getElementById('btn-randomize');
    if (btnRandomize) {
      btnRandomize.addEventListener('click', () => {
        const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const randFloat = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);

        const skins = ['#fcd4b8', '#ffdfba', '#f7c59f', '#e0ac69', '#c68642', '#8d5524'];
        const hairs = ['#1e0f08', '#111111', '#5a3825', '#d4a359', '#e65100', '#c2185b', '#7b1fa2'];
        const shirts = ['#c91815', '#1565c0', '#2e7d32', '#f57f17', '#6a1b9a', '#00838f', '#d81b60'];
        const badges = ['1', '2', '7', '8', 'A', '★', '♥', '🍃', '🔥', '⚡'];

        const randomCfg = {
          colors: {
            skin: randItem(skins),
            hair: randItem(hairs),
            shirt: randItem(shirts),
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
            text: randItem(badges),
            shape: 'rounded-rect'
          },
          proportions: {
            headScaleX: randFloat(0.95, 1.15),
            headScaleY: randFloat(0.95, 1.10),
            earScale: randFloat(0.85, 1.30),
            bodyChubby: randFloat(0.92, 1.18),
            armAngle: randFloat(0.20, 0.38)
          },
          hairStyle: randItem(['bowl-cut', 'short', 'spiky']),
          expression: {
            mouth: randItem(['smile', 'laugh', 'neutral', 'surprised']),
            eyeStyle: randItem(['oval', 'wink']),
            blush: true
          }
        };

        applyFullConfig(randomCfg);
        refreshOutlinerTree();
        showToast('🎲 Karakter berhasil diacak!');
      });
    }

    const btnResetChar = document.getElementById('btn-reset-char');
    if (btnResetChar) {
      btnResetChar.addEventListener('click', () => {
        applyFullConfig(DEFAULT_CONFIG);
        refreshOutlinerTree();
        showToast('⟲ Karakter direset ke Master V1!');
      });
    }
  }

  function setupImportExport() {
    // Export JSON
    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const config = currentRig.getConfig ? currentRig.getConfig() : DEFAULT_CONFIG;
        const projectData = {
          config: config,
          parts: currentRig.getObjectList ? currentRig.getObjectList() : []
        };
        const jsonStr = JSON.stringify(projectData, null, 2);
        downloadFile(jsonStr, 'villager_project.json', 'application/json');
        showToast('📥 Konfigurasi Proyek JSON berhasil diunduh!');
      });
    }

    // Import JSON
    const btnImportJson = document.getElementById('btn-import-json');
    const inputImportFile = document.getElementById('input-import-file');
    if (btnImportJson && inputImportFile) {
      btnImportJson.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const loaded = JSON.parse(event.target.result);
            if (loaded.config) {
              applyFullConfig(loaded.config);
            }
            if (loaded.parts && Array.isArray(loaded.parts)) {
              loaded.parts.forEach((p) => {
                if (p.isCustom && currentRig.addPrimitivePart) {
                  currentRig.addPrimitivePart({
                    type: p.geomType,
                    name: p.name,
                    parentGroupId: p.category,
                    color: p.color,
                    position: p.position,
                    rotation: p.rotation,
                    scale: p.scale
                  });
                } else if (currentRig.updateObjectTransform) {
                  currentRig.updateObjectTransform(p.id, {
                    position: p.position,
                    rotation: p.rotation,
                    scale: p.scale
                  });
                  if (p.color) currentRig.updateObjectMaterial(p.id, { color: p.color });
                }
              });
            }
            refreshOutlinerTree();
            showToast('📤 Konfigurasi Proyek berhasil dimuat!');
          } catch (err) {
            alert('File JSON tidak valid atau rusak: ' + err.message);
          }
          inputImportFile.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Export .GLB
    const btnExportGlb = document.getElementById('btn-export-glb');
    if (btnExportGlb) {
      btnExportGlb.addEventListener('click', () => {
        if (!window.THREE || !window.THREE.GLTFExporter) {
          alert('GLTFExporter belum dimuat.');
          return;
        }

        btnExportGlb.disabled = true;
        btnExportGlb.textContent = '⏳ Mengekspor 3D...';

        // Temporarily hide selection box so it's not exported
        const selBox = currentRig.selectionBox;
        const selVis = selBox ? selBox.visible : false;
        if (selBox) selBox.visible = false;

        const exporter = new THREE.GLTFExporter();
        exporter.parse(
          currentRig.root,
          function (result) {
            btnExportGlb.disabled = false;
            btnExportGlb.textContent = '📦 Ekspor Model 3D (.GLB)';
            if (selBox) selBox.visible = selVis;

            if (result instanceof ArrayBuffer) {
              const blob = new Blob([result], { type: 'model/gltf-binary' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'villager_modular_character.glb';
              link.click();
              URL.revokeObjectURL(url);
              showToast('📦 Model 3D .GLB berhasil diekspor!');
            }
          },
          function (error) {
            btnExportGlb.disabled = false;
            btnExportGlb.textContent = '📦 Ekspor Model 3D (.GLB)';
            if (selBox) selBox.visible = selVis;
            console.error('GLTF Export Error:', error);
            alert('Gagal mengekspor GLB: ' + error.message);
          },
          { binary: true }
        );
      });
    }
  }

  // --- HELPERS ---
  function applyFullConfig(config) {
    if (!currentRig) return;
    if (currentRig.applyConfig) currentRig.applyConfig(config);
    syncUIToConfig(config);
  }

  function syncUIToConfig(cfg) {
    if (!cfg) return;

    if (cfg.colors) {
      for (const [key, val] of Object.entries(cfg.colors)) {
        const input = document.getElementById(`color-${key}`);
        const hex = document.getElementById(`hex-${key}`);
        if (input) input.value = val;
        if (hex) hex.textContent = String(val).toUpperCase();
      }
    }

    if (cfg.badge) {
      const badgeText = document.getElementById('input-badge-text');
      const badgeShape = document.getElementById('select-badge-shape');
      if (badgeText && cfg.badge.text !== undefined) badgeText.value = cfg.badge.text;
      if (badgeShape && cfg.badge.shape) badgeShape.value = cfg.badge.shape;
    }

    if (cfg.proportions) {
      const p = cfg.proportions;
      const syncSlider = (id, badgeId, val) => {
        const el = document.getElementById(id);
        const b = document.getElementById(badgeId);
        if (el && val !== undefined) el.value = val;
        if (b && val !== undefined) b.textContent = Number(val).toFixed(2) + '×';
      };
      syncSlider('slider-head-x', 'val-head-x', p.headScaleX);
      syncSlider('slider-head-y', 'val-head-y', p.headScaleY);
      syncSlider('slider-ear-scale', 'val-ear-scale', p.earScale);
      syncSlider('slider-body-chubby', 'val-body-chubby', p.bodyChubby);
      syncSlider('slider-arm-angle', 'val-arm-angle', p.armAngle);
    }

    if (cfg.hairStyle) {
      document.querySelectorAll('.hair-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-style') === cfg.hairStyle);
      });
    }

    if (cfg.expression) {
      if (cfg.expression.mouth) {
        document.querySelectorAll('.mouth-btn').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-mouth') === cfg.expression.mouth);
        });
      }
      if (cfg.expression.eyeStyle) {
        document.querySelectorAll('.eye-btn').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-eye') === cfg.expression.eyeStyle);
        });
      }
      const blush = document.getElementById('toggle-blush');
      if (blush && cfg.expression.blush !== undefined) {
        blush.checked = !!cfg.expression.blush;
      }
    }
  }

  // =========================================================================
  // MOTION & POSE STUDIO CONTROLS
  // =========================================================================
  function setupMotionAndPoseControls() {
    const motionBtns = document.querySelectorAll('.motion-btn');
    const btnPause = document.getElementById('btn-motion-toggle-pause');
    const pauseIcon = document.getElementById('motion-pause-icon');
    const pauseText = document.getElementById('motion-pause-text');
    const speedSlider = document.getElementById('slider-motion-speed');
    const speedVal = document.getElementById('val-motion-speed');
    const btnManual = document.getElementById('btn-toggle-manual-pose');
    const btnResetFK = document.getElementById('btn-reset-fk-pose');

    // 1. Motion Presets (Idle, Walk, Run, Wave, Dance, Cheer)
    motionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const motion = btn.getAttribute('data-motion');
        if (!motion) return;
        motionBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        if (btnManual) {
          btnManual.innerHTML = '<span>🖐️</span> Aktifkan Pose Manual';
          btnManual.classList.remove('active');
        }

        const anim = currentRig ? currentRig.animator : null;
        if (anim) {
          anim.setMotion(motion);
        }
      });
    });

    // 2. Play / Pause Playback
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        const anim = currentRig ? currentRig.animator : null;
        if (!anim) return;
        const isPaused = !anim.isPaused;
        anim.setPaused(isPaused);
        if (isPaused) {
          if (pauseIcon) pauseIcon.textContent = '▶️';
          if (pauseText) pauseText.textContent = 'Lanjut Gerakan';
          btnPause.classList.add('active');
        } else {
          if (pauseIcon) pauseIcon.textContent = '⏸️';
          if (pauseText) pauseText.textContent = 'Jeda Gerakan';
          btnPause.classList.remove('active');
        }

        // Keep top bar button synchronized
        const topAnimBtn = document.getElementById('btn-anim');
        if (topAnimBtn) {
          topAnimBtn.innerHTML = isPaused ? '<span>▶️</span> Lanjut Gerak' : '<span>⏸️</span> Jeda Gerak';
          topAnimBtn.classList.toggle('active', !isPaused);
        }
      });
    }

    // 3. Playback Speed Slider
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (speedVal) speedVal.textContent = `${val.toFixed(1)}×`;
        const anim = currentRig ? currentRig.animator : null;
        if (anim) {
          anim.setSpeed(val);
        }
      });
    }

    // 4. FK Rigging Sliders Definitions
    const fkSliders = [
      { id: 'slider-fk-head-x', valId: 'val-fk-head-x', key: 'headPitch' },
      { id: 'slider-fk-head-y', valId: 'val-fk-head-y', key: 'headYaw' },
      { id: 'slider-fk-head-z', valId: 'val-fk-head-z', key: 'headRoll' },
      { id: 'slider-fk-larm-x', valId: 'val-fk-larm-x', key: 'lArmPitch' },
      { id: 'slider-fk-larm-roll', valId: 'val-fk-larm-roll', key: 'lArmRoll' },
      { id: 'slider-fk-lelbow-flex', valId: 'val-fk-lelbow-flex', key: 'lElbowFlex' },
      { id: 'slider-fk-rarm-x', valId: 'val-fk-rarm-x', key: 'rArmPitch' },
      { id: 'slider-fk-rarm-roll', valId: 'val-fk-rarm-roll', key: 'rArmRoll' },
      { id: 'slider-fk-relbow-flex', valId: 'val-fk-relbow-flex', key: 'rElbowFlex' },
      { id: 'slider-fk-lleg-x', valId: 'val-fk-lleg-x', key: 'lLegPitch' },
      { id: 'slider-fk-lknee-flex', valId: 'val-fk-lknee-flex', key: 'lKneeFlex' },
      { id: 'slider-fk-rleg-x', valId: 'val-fk-rleg-x', key: 'rLegPitch' },
      { id: 'slider-fk-rknee-flex', valId: 'val-fk-rknee-flex', key: 'rKneeFlex' }
    ];

    function updateFKPoseFromSliders() {
      const anim = currentRig ? currentRig.animator : null;
      if (!anim) return;
      const pose = {};
      fkSliders.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) {
          pose[s.key] = parseFloat(el.value) || 0;
        }
      });
      anim.setManualPose(pose);
      motionBtns.forEach((b) => b.classList.remove('active'));
      if (btnManual) {
        btnManual.innerHTML = '<span>✅</span> Mode Pose Aktif';
        btnManual.classList.add('active');
      }
    }

    function resetFKSliders() {
      fkSliders.forEach((s) => {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        if (el) el.value = 0;
        if (valEl) valEl.textContent = '0°';
      });
    }

    fkSliders.forEach((s) => {
      const el = document.getElementById(s.id);
      const valEl = document.getElementById(s.valId);
      if (el) {
        el.addEventListener('input', () => {
          if (valEl) valEl.textContent = `${el.value}°`;
          updateFKPoseFromSliders();
        });
      }
    });

    // 5. Manual Pose Toggle & Reset Buttons
    if (btnManual) {
      btnManual.addEventListener('click', () => {
        const anim = currentRig ? currentRig.animator : null;
        if (!anim) return;
        const isManual = !anim.manualPose;
        anim.manualPose = isManual;
        if (isManual) {
          anim.setMotion('pose');
          motionBtns.forEach((b) => b.classList.remove('active'));
          btnManual.innerHTML = '<span>✅</span> Mode Pose Aktif';
          btnManual.classList.add('active');
          updateFKPoseFromSliders();
        } else {
          anim.setMotion('idle');
          const idleBtn = document.querySelector('.motion-btn[data-motion="idle"]');
          if (idleBtn) idleBtn.classList.add('active');
          btnManual.innerHTML = '<span>🖐️</span> Aktifkan Pose Manual';
          btnManual.classList.remove('active');
        }
      });
    }

    if (btnResetFK) {
      btnResetFK.addEventListener('click', () => {
        resetFKSliders();
        const anim = currentRig ? currentRig.animator : null;
        if (anim) {
          anim.resetPose();
          anim.setMotion('idle');
          const idleBtn = document.querySelector('.motion-btn[data-motion="idle"]');
          if (idleBtn) {
            motionBtns.forEach((b) => b.classList.remove('active'));
            idleBtn.classList.add('active');
          }
          if (btnManual) {
            btnManual.innerHTML = '<span>🖐️</span> Aktifkan Pose Manual';
            btnManual.classList.remove('active');
          }
        }
        showToast('Pose sendi di-reset ke berdiri tegak!');
      });
    }

    // 6. Skeleton & Joint Visualizer Toggle
    const btnToggleSkeleton = document.getElementById('btn-toggle-skeleton');
    const skeletonToggleText = document.getElementById('skeleton-toggle-text');
    if (btnToggleSkeleton) {
      btnToggleSkeleton.addEventListener('click', () => {
        if (!currentRig || !currentRig.setSkeletonVisibility) return;
        const isVis = !currentRig.getSkeletonVisibility();
        currentRig.setSkeletonVisibility(isVis);
        btnToggleSkeleton.classList.toggle('active', isVis);
        if (skeletonToggleText) {
          skeletonToggleText.textContent = isVis ? 'Sembunyikan Sendi & Skeleton' : 'Tampilkan Sendi & Skeleton';
        }
        const topSkelBtn = document.getElementById('btn-skeleton');
        if (topSkelBtn) topSkelBtn.classList.toggle('active', isVis);
        showToast(isVis ? 'Skeleton & Sendi ditampilkan!' : 'Skeleton disembunyikan.');
      });
    }
  }

  // =========================================================================
  // FACIAL ROLE, BLINK & MOUTH CONTROLS (Wajah, Kedip & Mulut)
  // =========================================================================
  function updateFacialStatusUI() {
    if (!currentRig || !currentRig.getFacialRoles) return;
    const roles = currentRig.getFacialRoles();
    const elEyeL = document.getElementById('status-role-eyel');
    const elEyeR = document.getElementById('status-role-eyer');
    const elMouth = document.getElementById('status-role-mouth');

    if (elEyeL) elEyeL.textContent = roles.eye_left?.length ? roles.eye_left.join(', ') : 'Belum Ditentukan';
    if (elEyeR) elEyeR.textContent = roles.eye_right?.length ? roles.eye_right.join(', ') : 'Belum Ditentukan';
    if (elMouth) elMouth.textContent = roles.mouth?.length ? roles.mouth.join(', ') : 'Belum Ditentukan';
  }

  function setupFaceAndBlinkControls() {
    // 1. 3D Facial Markers Toggle
    const toggleMarkers = document.getElementById('toggle-facial-markers-switch');
    if (toggleMarkers) {
      toggleMarkers.addEventListener('change', () => {
        if (!currentRig || !currentRig.setFacialMarkersVisibility) return;
        currentRig.setFacialMarkersVisibility(toggleMarkers.checked);
        const topMarkersBtn = document.getElementById('btn-facial-markers');
        if (topMarkersBtn) topMarkersBtn.classList.toggle('active', toggleMarkers.checked);
        showToast(toggleMarkers.checked ? 'Tanda fitur wajah di kepala aktif!' : 'Tanda fitur wajah disembunyikan.');
      });
    }

    // 2. Auto-Blink Toggle
    const toggleAutoBlink = document.getElementById('toggle-auto-blink');
    if (toggleAutoBlink) {
      toggleAutoBlink.addEventListener('change', () => {
        if (!currentRig || !currentRig.setBlinkSettings) return;
        currentRig.setBlinkSettings({ autoBlink: toggleAutoBlink.checked });
        showToast(toggleAutoBlink.checked ? 'Kedip otomatis aktif!' : 'Kedip otomatis dimatikan.');
      });
    }

    // 3. Blink Interval Slider
    const sliderBlinkInt = document.getElementById('slider-blink-interval');
    const valBlinkInt = document.getElementById('val-blink-interval');
    if (sliderBlinkInt) {
      sliderBlinkInt.addEventListener('input', () => {
        const val = parseFloat(sliderBlinkInt.value);
        if (valBlinkInt) valBlinkInt.textContent = val.toFixed(1) + 's';
        if (currentRig && currentRig.setBlinkSettings) {
          currentRig.setBlinkSettings({ interval: val });
        }
      });
    }

    // 4. Manual Blink (Squint) Slider
    const sliderManualBlink = document.getElementById('slider-manual-blink');
    const valManualBlink = document.getElementById('val-manual-blink');
    if (sliderManualBlink) {
      sliderManualBlink.addEventListener('input', () => {
        const val = parseInt(sliderManualBlink.value, 10);
        if (valManualBlink) valManualBlink.textContent = val + '%';
        if (currentRig && currentRig.setBlinkSettings) {
          currentRig.setBlinkSettings({ manualBlink: val / 100 });
        }
      });
    }

    // 5. Trigger Blink Once Button
    const btnTriggerBlink = document.getElementById('btn-trigger-blink');
    if (btnTriggerBlink) {
      btnTriggerBlink.addEventListener('click', () => {
        if (currentRig && currentRig.triggerBlink) {
          currentRig.triggerBlink();
          showToast('Mata dikedipkan! 👁️');
        }
      });
    }

    // 6. Blink Mode Buttons (both, right, left, closed)
    const blinkModeBtns = document.querySelectorAll('.blink-mode-btn');
    blinkModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-blink-mode');
        blinkModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (currentRig && currentRig.setBlinkSettings) {
          currentRig.setBlinkSettings({ mode: mode });
        }
      });
    });

    // 7. Mouth Condition Preset Buttons
    const mouthCondBtns = document.querySelectorAll('.mouth-cond-btn');
    mouthCondBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cond = btn.getAttribute('data-mouth-cond');
        mouthCondBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (currentRig && currentRig.setMouthSettings) {
          currentRig.setMouthSettings({ condition: cond });
        }
      });
    });

    // 8. Mouth Open Slider
    const sliderMouthOpen = document.getElementById('slider-mouth-open');
    const valMouthOpen = document.getElementById('val-mouth-open');
    if (sliderMouthOpen) {
      sliderMouthOpen.addEventListener('input', () => {
        const val = parseFloat(sliderMouthOpen.value);
        if (valMouthOpen) valMouthOpen.textContent = val.toFixed(2);
        if (currentRig && currentRig.setMouthSettings) {
          currentRig.setMouthSettings({ open: val });
        }
      });
    }

    // 9. Mouth Width Slider
    const sliderMouthWidth = document.getElementById('slider-mouth-width');
    const valMouthWidth = document.getElementById('val-mouth-width');
    if (sliderMouthWidth) {
      sliderMouthWidth.addEventListener('input', () => {
        const val = parseFloat(sliderMouthWidth.value);
        if (valMouthWidth) valMouthWidth.textContent = val.toFixed(2) + '×';
        if (currentRig && currentRig.setMouthSettings) {
          currentRig.setMouthSettings({ width: val });
        }
      });
    }

    // 10. Mouth Curve Slider
    const sliderMouthCurve = document.getElementById('slider-mouth-curve');
    const valMouthCurve = document.getElementById('val-mouth-curve');
    if (sliderMouthCurve) {
      sliderMouthCurve.addEventListener('input', () => {
        const val = parseFloat(sliderMouthCurve.value);
        if (valMouthCurve) valMouthCurve.textContent = (val >= 0 ? '+' : '') + val.toFixed(2);
        if (currentRig && currentRig.setMouthSettings) {
          currentRig.setMouthSettings({ curve: val });
        }
      });
    }

    // 11. Auto-Talk Switch
    const toggleAutoTalk = document.getElementById('toggle-auto-talk');
    if (toggleAutoTalk) {
      toggleAutoTalk.addEventListener('change', () => {
        if (currentRig && currentRig.setMouthSettings) {
          currentRig.setMouthSettings({ autoTalk: toggleAutoTalk.checked });
          showToast(toggleAutoTalk.checked ? 'Animasi bicara aktif!' : 'Animasi bicara dimatikan.');
        }
      });
    }

    updateFacialStatusUI();
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function showToast(msg) {
    let toast = document.getElementById('editor-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'editor-toast';
      toast.className = 'editor-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  window.CharacterEditor = {
    init: init,
    selectPart: selectPart,
    refreshTree: refreshOutlinerTree,
    applyConfig: applyFullConfig,
    getConfig: () => (currentRig && currentRig.getConfig ? currentRig.getConfig() : DEFAULT_CONFIG)
  };
})();
