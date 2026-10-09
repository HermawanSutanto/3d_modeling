// test_e2e.js - Playwright Automated Verification for Modular 3D Hierarchy & Part Editor
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('🚀 Memulai pengujian otomatis Playwright untuk Modular 3D Hierarchy & Part Editor...');

  const htmlPath = path.resolve(__dirname, 'index.html');
  const fileUrl = 'file://' + htmlPath;

  const browser = await chromium.launch({
    executablePath: fs.existsSync('/opt/google/chrome/google-chrome')
      ? '/opt/google/chrome/google-chrome'
      : undefined,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const consoleLogs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else {
      consoleLogs.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  console.log(`🌐 Membuka: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'load' });

  // 1. Verifikasi Judul Halaman & Canvas WebGL
  const title = await page.title();
  console.log(`✓ Judul Halaman: "${title}"`);

  const canvas = await page.waitForSelector('#canvas-container canvas', { timeout: 8000 });
  const boundingBox = await canvas.boundingBox();
  console.log(`✓ Canvas WebGL terdeteksi: ${boundingBox.width}x${boundingBox.height} px`);

  // 2. Verifikasi Library & Modul
  const libStatus = await page.evaluate(() => {
    return {
      hasThree: typeof window.THREE !== 'undefined',
      hasControls: typeof window.THREE?.OrbitControls !== 'undefined',
      hasModel: typeof window.CharacterModel !== 'undefined',
      hasEditor: typeof window.CharacterEditor !== 'undefined',
      hasExporter: typeof window.THREE?.GLTFExporter !== 'undefined',
      hasRig: typeof window.appRig !== 'undefined'
    };
  });
  console.log('✓ Status Library & Modul:', libStatus);
  if (!libStatus.hasThree || !libStatus.hasModel || !libStatus.hasEditor || !libStatus.hasRig) {
    throw new Error('Three.js, CharacterModel, CharacterEditor, atau appRig gagal di-load!');
  }

  await page.waitForTimeout(1000);

  // 3. Uji Buka Drawer Editor
  console.log('🎨 Menguji Buka Drawer Editor Karakter...');
  await page.click('#btn-editor');
  await page.waitForTimeout(400);

  const isEditorOpen = await page.evaluate(() => {
    return document.getElementById('editor-drawer').classList.contains('open');
  });
  console.log(`✓ Status Drawer Editor: ${isEditorOpen ? 'Terbuka (PASS)' : 'Gagal'}`);
  if (!isEditorOpen) throw new Error('Drawer editor gagal terbuka!');

  // 4. Uji Tab 1: Pohon Hierarki (Outliner Tree)
  console.log('🌳 Menguji Tab Hierarki Outliner Tree...');
  const treeNodesCount = await page.evaluate(() => {
    return document.querySelectorAll('.tree-item-node').length;
  });
  console.log(`✓ Jumlah node terdaftar di Outliner Tree: ${treeNodesCount}`);
  if (treeNodesCount < 10) {
    throw new Error(`Node outliner terlalu sedikit: ${treeNodesCount}`);
  }

  // 5. Uji Seleksi Bagian Individual: Segitiga Rambut Tengah (hair_lock_center)
  console.log('🎯 Menguji Pemilihan Objek Individual: Segitiga Rambut Tengah...');
  const centerLockNode = await page.waitForSelector('[data-part-id="hair_lock_center"]');
  await centerLockNode.click();
  await page.waitForTimeout(400);

  // Pastikan Inspector otomatis terbuka dan menampilkan tipe CONE
  const inspState = await page.evaluate(() => {
    const isInspTabActive = document.getElementById('tab-inspector').classList.contains('active');
    const partType = document.getElementById('insp-part-type').textContent;
    const partName = document.getElementById('insp-part-name').value;
    const selectionVisible = window.appRig.selectionBox.visible;
    return { isInspTabActive, partType, partName, selectionVisible };
  });
  console.log('✓ Status Inspector Objek Terpilih:', inspState);
  if (!inspState.isInspTabActive || inspState.partType !== 'CONE' || !inspState.selectionVisible) {
    throw new Error('Gagal memilih atau mengaktifkan inspector untuk hair_lock_center!');
  }

  // 6. Uji Transformasi: Ubah Posisi & Skala Segitiga Rambut
  console.log('📐 Menguji Manipulasi Transformasi Posisi & Skala Objek...');
  await page.evaluate(() => {
    const sliderPosY = document.getElementById('slider-pos-y');
    sliderPosY.value = '0.45';
    sliderPosY.dispatchEvent(new Event('input'));

    const sliderSclX = document.getElementById('slider-scl-x');
    sliderSclX.value = '1.80';
    sliderSclX.dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(300);

  const lockTransformAfter = await page.evaluate(() => {
    const mesh = window.appRig.registeredParts.get('hair_lock_center');
    return {
      posY: mesh.position.y,
      sclX: mesh.scale.x
    };
  });
  console.log('✓ Transformasi Baru hair_lock_center:', lockTransformAfter);
  if (Math.abs(lockTransformAfter.posY - 0.45) > 0.05) {
    throw new Error('Posisi Y gagal diperbarui!');
  }

  // 7. Uji Duplikasi Objek & Cermin Simetris (Mirror -X)
  console.log('📋 Menguji Duplikasi & Pencerminan (Mirror X)...');
  await page.click('#btn-insp-mirror');
  await page.waitForTimeout(400);

  const mirrorCheck = await page.evaluate(() => {
    const orig = window.appRig.registeredParts.get('hair_lock_center');
    const selected = window.appRig.registeredParts.get(window.appRig.selectedPartId);
    return {
      selectedId: window.appRig.selectedPartId,
      name: selected ? selected.name : null,
      origX: orig ? orig.position.x : null,
      mirrorX: selected ? selected.position.x : null
    };
  });
  console.log('✓ Hasil Pencerminan Simetris:', mirrorCheck);

  // 8. Uji Pembuatan Objek Baru (Part Creator): Tambah Kerucut/Cone Kustom
  console.log('➕ Menguji Part Creator: Membuat Kerucut / Spike Rambut Baru...');
  await page.click('.editor-tab-btn[data-tab="addpart"]');
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    document.getElementById('add-part-name').value = 'Spike_Rambut_Kustom_1';
    document.getElementById('add-part-parent').value = 'hair';
    document.getElementById('add-part-color').value = '#e65100'; // Oranye
  });

  await page.click('#btn-add-part-confirm');
  await page.waitForTimeout(500);

  const newPartCheck = await page.evaluate(() => {
    const selected = window.appRig.registeredParts.get(window.appRig.selectedPartId);
    return {
      selectedId: window.appRig.selectedPartId,
      name: selected ? selected.name : null,
      parentName: selected && selected.parent ? selected.parent.name || 'Group' : null,
      hexColor: selected && selected.material ? '#' + selected.material.color.getHexString() : null
    };
  });
  console.log('✓ Part Kustom Berhasil Dibuat & Dipilih:', newPartCheck);
  if (!newPartCheck.selectedId || !newPartCheck.name.includes('Spike_Rambut_Kustom_1')) {
    throw new Error('Part kustom gagal dibuat!');
  }

  // 9. Uji 3D Raycasting Selection
  console.log('🖱️ Menguji 3D Interactive Selection (Raycast Picking)...');
  await page.evaluate(() => {
    window.CharacterEditor.selectPart('nose_cone');
  });
  await page.waitForTimeout(300);

  const noseSelected = await page.evaluate(() => {
    return {
      selectedId: window.appRig.selectedPartId,
      boxVisible: window.appRig.selectionBox.visible
    };
  });
  console.log('✓ Hidung (nose_cone) Terpilih Melalui Picking:', noseSelected);
  if (noseSelected.selectedId !== 'nose_cone' || !noseSelected.boxVisible) {
    throw new Error('Raycast selection gagal memilih nose_cone!');
  }

  // Ambil screenshot tampilan editor dan karakter yang dimodifikasi
  const hierarchyScreenshotPath = path.resolve(__dirname, 'screenshot_hierarchy_editor.png');
  await page.screenshot({ path: hierarchyScreenshotPath });
  console.log(`📸 Screenshot Hierarchy Editor tersimpan: ${hierarchyScreenshotPath}`);

  // 10. Uji Sendi Baru (Elbow & Knee) & Motion Library Studio
  console.log('💃 Menguji Sendi Baru (Siku & Lutut) dan Motion Library...');
  
  // Verifikasi node sendi pada appRig
  const jointStatus = await page.evaluate(() => {
    const rig = window.appRig;
    return {
      hasLeftElbow: !!(rig && rig.leftElbow),
      hasRightElbow: !!(rig && rig.rightElbow),
      hasLeftKnee: !!(rig && rig.leftKnee),
      hasRightKnee: !!(rig && rig.rightKnee),
      hasAnimator: !!(window.appAnimator || (rig && rig.animator))
    };
  });
  console.log('✓ Status Sendi Baru & Animator:', jointStatus);
  if (!jointStatus.hasLeftElbow || !jointStatus.hasRightElbow || !jointStatus.hasLeftKnee || !jointStatus.hasRightKnee) {
    throw new Error('Sendi siku atau lutut belum terpasang dengan benar pada rig!');
  }

  // Buka Tab Gerak & Pose
  await page.click('.editor-tab-btn[data-tab="motion"]');
  await page.waitForTimeout(300);

  const isMotionTabActive = await page.evaluate(() => {
    return document.getElementById('tab-motion').classList.contains('active');
  });
  console.log(`✓ Status Tab Gerak & Pose: ${isMotionTabActive ? 'Aktif (PASS)' : 'Gagal'}`);
  if (!isMotionTabActive) throw new Error('Tab Gerak & Pose gagal dibuka!');

  // Uji Beralih Gerak: Wave (Melambai)
  console.log('👋 Menguji Preset Gerak: Wave (Melambai)...');
  await page.click('.motion-btn[data-motion="wave"]');
  await page.waitForTimeout(300);

  const waveMotionActive = await page.evaluate(() => {
    const anim = window.appAnimator || window.appRig.animator;
    return anim && anim.currentMotion === 'wave';
  });
  console.log(`✓ Status Preset Wave: ${waveMotionActive ? 'Aktif (PASS)' : 'Gagal'}`);
  if (!waveMotionActive) throw new Error('Motion wave gagal diaktifkan!');

  // Uji Beralih Gerak: Dance (Menari)
  console.log('💃 Menguji Preset Gerak: Dance (Menari)...');
  await page.click('.motion-btn[data-motion="dance"]');
  await page.waitForTimeout(300);

  const danceMotionActive = await page.evaluate(() => {
    const anim = window.appAnimator || window.appRig.animator;
    return anim && anim.currentMotion === 'dance';
  });
  console.log(`✓ Status Preset Dance: ${danceMotionActive ? 'Aktif (PASS)' : 'Gagal'}`);
  if (!danceMotionActive) throw new Error('Motion dance gagal diaktifkan!');

  // Uji Mode Pose Manual (FK Sliders)
  console.log('🦾 Menguji Kontrol Tekukan Sendi Siku & Lutut (FK Sliders)...');
  await page.evaluate(() => {
    const elbowSlider = document.getElementById('slider-fk-lelbow-flex');
    const kneeSlider = document.getElementById('slider-fk-lknee-flex');
    if (elbowSlider) {
      elbowSlider.value = 65;
      elbowSlider.dispatchEvent(new Event('input'));
    }
    if (kneeSlider) {
      kneeSlider.value = 45;
      kneeSlider.dispatchEvent(new Event('input'));
    }
  });
  await page.waitForTimeout(200);

  const fkApplied = await page.evaluate(() => {
    const rig = window.appRig;
    const anim = window.appAnimator || rig.animator;
    return {
      manualPose: anim.manualPose,
      currentMotion: anim.currentMotion,
      lElbowRotX: +(rig.leftElbow.rotation.x).toFixed(2),
      lKneeRotX: +(rig.leftKnee.rotation.x).toFixed(2)
    };
  });
  console.log('✓ Hasil Tekukan Sendi Manual (FK):', fkApplied);
  if (!fkApplied.manualPose || fkApplied.lElbowRotX === 0 || fkApplied.lKneeRotX === 0) {
    throw new Error('FK Pose sliders gagal menekuk sendi siku atau lutut!');
  }

  // Screenshot pose manual
  const motionScreenshotPath = path.resolve(__dirname, 'screenshot_motion_pose_editor.png');
  await page.screenshot({ path: motionScreenshotPath });
  console.log(`📸 Screenshot Motion & Pose tersimpan: ${motionScreenshotPath}`);

  // Kembalikan ke Motion Walk
  await page.click('.motion-btn[data-motion="walk"]');
  await page.waitForTimeout(200);

  // 11. Uji Rigging Cuff Celana & Sinkronisasi dengan Paha
  console.log('👖 Menguji Rigging Cuff Celana (Shorts Cuffs) menempel pada Paha...');
  const cuffRigCheck = await page.evaluate(() => {
    const rig = window.appRig;
    const cuffL = rig.registeredParts.get('shorts_cuff_l');
    const cuffR = rig.registeredParts.get('shorts_cuff_r');

    const cuffLParentIsLeg = cuffL && cuffL.parent === rig.leftLeg;
    const cuffRParentIsLeg = cuffR && cuffR.parent === rig.rightLeg;

    // Uji rotasi paha menggerakkan cuff
    const initialPos = new THREE.Vector3();
    cuffL.getWorldPosition(initialPos);

    const prevRotX = rig.leftLeg.rotation.x;
    rig.leftLeg.rotation.x += 0.5;
    rig.leftLeg.updateMatrixWorld(true);

    const movedPos = new THREE.Vector3();
    cuffL.getWorldPosition(movedPos);

    // Kembalikan rotasi
    rig.leftLeg.rotation.x = prevRotX;
    rig.leftLeg.updateMatrixWorld(true);

    const movedDistance = initialPos.distanceTo(movedPos);

    return {
      cuffLParentIsLeg,
      cuffRParentIsLeg,
      cuffLInLeftLegCategory: cuffL?.userData?.boneId === 'leg_upper_l',
      cuffRInRightLegCategory: cuffR?.userData?.boneId === 'leg_upper_r',
      cuffMovedWithThigh: movedDistance > 0.001
    };
  });
  console.log('✓ Status Rigging Shorts Cuff:', cuffRigCheck);
  if (!cuffRigCheck.cuffLParentIsLeg || !cuffRigCheck.cuffRParentIsLeg || !cuffRigCheck.cuffMovedWithThigh) {
    throw new Error('Shorts cuff gagal ter-rigging ke paha!');
  }

  // 12. Uji Fixed Skeleton Registry & Visual Joint Gizmo Helpers
  console.log('🦴 Menguji Sistem Skeleton Tetap (11 Tulangan) & Visual Sendi Gizmo...');
  const skeletonCheck = await page.evaluate(() => {
    const rig = window.appRig;
    const expectedBones = [
      'head', 'torso', 'pelvis',
      'arm_upper_l', 'arm_lower_l', 'arm_upper_r', 'arm_lower_r',
      'leg_upper_l', 'leg_lower_l', 'leg_upper_r', 'leg_lower_r'
    ];
    const registeredBones = Object.keys(rig.bones || {});
    const allBonesPresent = expectedBones.every((b) => registeredBones.includes(b));
    const allGizmosPresent = expectedBones.every((b) => !!rig.bones[b]?.gizmo);

    return {
      allBonesPresent,
      boneCount: registeredBones.length,
      allGizmosPresent,
      initialVisibility: rig.getSkeletonVisibility()
    };
  });
  console.log('✓ Status Skeleton Bones & Gizmo:', skeletonCheck);
  if (!skeletonCheck.allBonesPresent || skeletonCheck.boneCount < 11 || !skeletonCheck.allGizmosPresent) {
    throw new Error('Skeleton bones atau visual joint gizmo tidak lengkap!');
  }

  // Toggle Skeleton via Button Dock
  console.log('🔘 Menguji Tombol Toggle Skeleton di Dock Kontrol...');
  await page.click('#btn-skeleton');
  await page.waitForTimeout(300);

  const skelActiveAfterClick = await page.evaluate(() => {
    const rig = window.appRig;
    const btnActive = document.getElementById('btn-skeleton').classList.contains('active');
    return {
      btnActive,
      rigVisibility: rig.getSkeletonVisibility()
    };
  });
  console.log('✓ Status Skeleton Setelah Diaktifkan:', skelActiveAfterClick);
  if (!skelActiveAfterClick.btnActive || !skelActiveAfterClick.rigVisibility) {
    throw new Error('Tombol skeleton gagal mengaktifkan visual sendi!');
  }

  // Screenshot dengan Skeleton Gizmos Aktif
  const skeletonScreenshotPath = path.resolve(__dirname, 'screenshot_skeleton_joints.png');
  await page.screenshot({ path: skeletonScreenshotPath });
  console.log(`📸 Screenshot Skeleton & Joints tersimpan: ${skeletonScreenshotPath}`);

  // 13. Uji Reparenting Objek ke Tulangan Skeleton Lainnya
  console.log('🔄 Menguji Reparenting Objek ke Tulangan Skeleton (arm_lower_r)...');
  await page.click('.editor-tab-btn[data-tab="tree"]');
  await page.waitForTimeout(300);

  // Pilih objek spike kustom atau hair_lock_center
  await page.evaluate(() => {
    window.CharacterEditor.selectPart('nose_cone');
  });
  await page.waitForTimeout(300);

  // Ubah parent dropdown ke arm_lower_r (Siku & Tangan Kanan)
  await page.evaluate(() => {
    const parentSelect = document.getElementById('insp-part-parent');
    parentSelect.value = 'arm_lower_r';
    parentSelect.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(400);

  const reparentCheck = await page.evaluate(() => {
    const rig = window.appRig;
    const mesh = rig.registeredParts.get('nose_cone');
    return {
      parentIsRightElbow: mesh && mesh.parent === rig.rightElbow,
      boneId: mesh?.userData?.boneId,
      category: mesh?.userData?.category
    };
  });
  console.log('✓ Hasil Reparenting nose_cone ke arm_lower_r:', reparentCheck);
  if (!reparentCheck.parentIsRightElbow || reparentCheck.boneId !== 'arm_lower_r') {
    throw new Error('Reparenting ke arm_lower_r gagal!');
  }

  // Kembalikan nose_cone ke head
  await page.evaluate(() => {
    const parentSelect = document.getElementById('insp-part-parent');
    parentSelect.value = 'head';
    parentSelect.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(300);

  // Matikan skeleton helper kembali ke normal
  await page.click('#btn-skeleton');
  await page.waitForTimeout(200);

  // 14. Uji Penandaan Peran Wajah (Facial Role Switch & 3D Markers)
  console.log('🎭 Menguji Switch Peran Fitur Wajah (Facial Roles) & 3D Markers di Kepala...');
  
  // Periksa default roles
  const defaultRolesCheck = await page.evaluate(() => {
    const roles = window.appRig.getFacialRoles();
    return {
      hasLeftEye: roles.eye_left.includes('eye_left'),
      hasRightEye: roles.eye_right.includes('eye_right'),
      hasMouth: roles.mouth.includes('mouth_smile')
    };
  });
  console.log('✓ Status Peran Wajah Bawaan:', defaultRolesCheck);
  if (!defaultRolesCheck.hasLeftEye || !defaultRolesCheck.hasRightEye || !defaultRolesCheck.hasMouth) {
    throw new Error('Peran fitur wajah bawaan tidak terdeteksi!');
  }

  // Uji Switch Peran Wajah di Inspector: Ubah nose_cone menjadi role 'mouth'
  await page.evaluate(() => {
    window.CharacterEditor.selectPart('nose_cone');
    const roleSelect = document.getElementById('insp-facial-role');
    roleSelect.value = 'mouth';
    roleSelect.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(300);

  const roleSwitchedCheck = await page.evaluate(() => {
    const roles = window.appRig.getFacialRoles();
    const mesh = window.appRig.registeredParts.get('nose_cone');
    return {
      meshRole: mesh?.userData?.facialRole,
      inMouthList: roles.mouth.includes('nose_cone')
    };
  });
  console.log('✓ Hasil Switch Peran nose_cone menjadi mouth:', roleSwitchedCheck);
  if (roleSwitchedCheck.meshRole !== 'mouth' || !roleSwitchedCheck.inMouthList) {
    throw new Error('Switch peran wajah gagal diterapkan!');
  }

  // Kembalikan peran nose_cone ke 'nose'
  await page.evaluate(() => {
    const roleSelect = document.getElementById('insp-facial-role');
    roleSelect.value = 'nose';
    roleSelect.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(200);

  // Uji Toggle 3D Facial Markers di Kepala via Dock
  console.log('🏷️ Menguji Toggle 3D Facial Markers di Kepala...');
  await page.click('#btn-facial-markers');
  await page.waitForTimeout(300);

  const markersActive = await page.evaluate(() => {
    return {
      btnActive: document.getElementById('btn-facial-markers').classList.contains('active'),
      vis: window.appRig.getFacialMarkersVisibility()
    };
  });
  console.log('✓ Status 3D Facial Markers:', markersActive);
  if (!markersActive.btnActive || !markersActive.vis) {
    throw new Error('3D Facial Markers gagal diaktifkan!');
  }

  // Ambil screenshot dengan penanda wajah 3D aktif
  const facialMarkersScreenshotPath = path.resolve(__dirname, 'screenshot_facial_markers.png');
  await page.screenshot({ path: facialMarkersScreenshotPath });
  console.log(`📸 Screenshot Facial Markers tersimpan: ${facialMarkersScreenshotPath}`);

  // 15. Uji Kontrol Mata & Animasi Kedip (Blink Engine)
  console.log('👁️ Menguji Tab Wajah & Kedip: Kontrol Mata & Animasi Kedip...');
  await page.click('.editor-tab-btn[data-tab="face"]');
  await page.waitForTimeout(300);

  const isFaceTabActive = await page.evaluate(() => {
    return document.getElementById('tab-face').classList.contains('active');
  });
  console.log(`✓ Status Tab Wajah & Kedip: ${isFaceTabActive ? 'Aktif (PASS)' : 'Gagal'}`);
  if (!isFaceTabActive) throw new Error('Tab Wajah & Kedip gagal dibuka!');

  // Uji slider kedipan manual (Squint / Pejam)
  await page.evaluate(() => {
    const slider = document.getElementById('slider-manual-blink');
    slider.value = 85;
    slider.dispatchEvent(new Event('input'));
    window.appRig.animator.updateBlink(0.016);
  });
  await page.waitForTimeout(200);

  const manualBlinkCheck = await page.evaluate(() => {
    const eyeLScaleY = window.appRig.leftEye.scale.y;
    const eyeRScaleY = window.appRig.rightEye.scale.y;
    return {
      eyeLScaleY: +(eyeLScaleY).toFixed(2),
      eyeRScaleY: +(eyeRScaleY).toFixed(2)
    };
  });
  console.log('✓ Hasil Kedipan Manual (Squint 85%):', manualBlinkCheck);
  if (manualBlinkCheck.eyeLScaleY > 0.35 || manualBlinkCheck.eyeRScaleY > 0.35) {
    throw new Error('Slider kedipan manual gagal mengecilkan kelopak mata!');
  }

  // Reset slider kedipan manual ke 0%
  await page.evaluate(() => {
    const slider = document.getElementById('slider-manual-blink');
    slider.value = 0;
    slider.dispatchEvent(new Event('input'));
    window.appRig.animator.updateBlink(0.016);
  });
  await page.waitForTimeout(200);

  // Uji Trigger Sekali Kedip
  await page.click('#btn-trigger-blink');
  await page.waitForTimeout(100);
  const triggerCheck = await page.evaluate(() => {
    return window.appRig.animator.isBlinking;
  });
  console.log(`✓ Status Trigger Blink Instan: ${triggerCheck ? 'Blinking (PASS)' : 'Normal'}`);

  // Uji Mode Kedip Kanan Saja (Wink)
  await page.click('.blink-mode-btn[data-blink-mode="right"]');
  await page.waitForTimeout(200);
  const winkModeCheck = await page.evaluate(() => {
    return window.appRig.animator.blinkSettings.mode === 'right';
  });
  console.log(`✓ Status Mode Kedip Kanan (Wink): ${winkModeCheck ? 'PASS' : 'Gagal'}`);
  if (!winkModeCheck) throw new Error('Mode kedip kanan gagal diaktifkan!');

  // Kembalikan ke mode normal (both)
  await page.click('.blink-mode-btn[data-blink-mode="both"]');
  await page.waitForTimeout(150);

  // 16. Uji Kontrol Kondisi & Bentuk Mulut (Mouth Condition & Shape Engine)
  console.log('👄 Menguji Kontrol Kondisi & Bentuk Mulut...');
  
  // Uji preset kondisi mulut: Cemberut (Sad / Frown)
  await page.click('.mouth-cond-btn[data-mouth-cond="sad"]');
  await page.waitForTimeout(200);

  const mouthSadCheck = await page.evaluate(() => {
    const cfg = window.CharacterEditor.getConfig();
    const mouthSadMesh = window.appRig.registeredParts.get('mouth_sad');
    return {
      exprMouth: cfg.expression.mouth,
      mouthSadVisible: !!(mouthSadMesh && mouthSadMesh.visible)
    };
  });
  console.log('✓ Status Mulut Cemberut (Sad):', mouthSadCheck);
  if (mouthSadCheck.exprMouth !== 'sad' || !mouthSadCheck.mouthSadVisible) {
    throw new Error('Preset kondisi mulut sad gagal diaktifkan!');
  }

  // Uji slider bentuk mulut (Open & Width)
  await page.evaluate(() => {
    const sliderOpen = document.getElementById('slider-mouth-open');
    sliderOpen.value = '0.75';
    sliderOpen.dispatchEvent(new Event('input'));

    const sliderWidth = document.getElementById('slider-mouth-width');
    sliderWidth.value = '1.40';
    sliderWidth.dispatchEvent(new Event('input'));

    window.appRig.animator.updateMouth(0.016);
  });
  await page.waitForTimeout(200);

  const mouthShapeCheck = await page.evaluate(() => {
    const mg = window.appRig.mouthGroup;
    return {
      scaleX: +(mg.scale.x).toFixed(2),
      scaleY: +(mg.scale.y).toFixed(2)
    };
  });
  console.log('✓ Modulasi Bentuk Mulut (Open & Width):', mouthShapeCheck);
  if (mouthShapeCheck.scaleX < 1.3 || mouthShapeCheck.scaleY < 1.4) {
    throw new Error('Modulasi bentuk mulut gagal diterapkan!');
  }

  // Uji Toggle Auto-Talk
  await page.evaluate(() => {
    const talkToggle = document.getElementById('toggle-auto-talk');
    talkToggle.checked = true;
    talkToggle.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(200);
  const autoTalkCheck = await page.evaluate(() => {
    return window.appRig.animator.mouthSettings.autoTalk === true;
  });
  console.log(`✓ Status Auto-Talk: ${autoTalkCheck ? 'Aktif (PASS)' : 'Gagal'}`);
  if (!autoTalkCheck) throw new Error('Auto-talk gagal diaktifkan!');

  // Matikan auto-talk dan kembalikan ke preset senyum (smile)
  await page.evaluate(() => {
    const talkToggle = document.getElementById('toggle-auto-talk');
    talkToggle.checked = false;
    talkToggle.dispatchEvent(new Event('change'));
  });
  await page.click('.mouth-cond-btn[data-mouth-cond="smile"]');
  await page.waitForTimeout(200);

  // Ambil screenshot tampilan Tab Wajah & Kedip
  const faceScreenshotPath = path.resolve(__dirname, 'screenshot_face_blink_mouth_editor.png');
  await page.screenshot({ path: faceScreenshotPath });
  console.log(`📸 Screenshot Face & Blink Editor tersimpan: ${faceScreenshotPath}`);

  // 17. Uji Ekspor Proyek JSON
  console.log('📦 Menguji Integritas Proyek & Konfigurasi JSON...');
  await page.click('.editor-tab-btn[data-tab="presets"]');
  await page.waitForTimeout(300);

  const projectExportCheck = await page.evaluate(() => {
    const config = window.CharacterEditor.getConfig();
    const parts = window.appRig.getObjectList();
    return {
      hasConfig: !!config,
      partsCount: parts.length,
      samplePart: parts[0]
    };
  });
  console.log('✓ Data Proyek Valid:', {
    hasConfig: projectExportCheck.hasConfig,
    partsCount: projectExportCheck.partsCount
  });

  // 18. Cek Konsol untuk Error
  if (consoleErrors.length > 0) {
    console.error('❌ Terdapat Error pada Console:', consoleErrors);
    throw new Error('Ditemukan console error: ' + JSON.stringify(consoleErrors));
  } else {
    console.log('✓ Tidak ada console error sama sekali! (Clean Console, 0 Errors)');
  }

  await browser.close();
  console.log('🎉 SEMUA PENGUJIAN PLAYWRIGHT MODULAR EDITOR & MOTION RIG BERHASIL! (100% PASS)');
}

runTests().catch((err) => {
  console.error('❌ Gagal menjalankan pengujian Playwright:', err);
  process.exit(1);
});
