// test_gltf_head.js - Test loading scene.gltf head into the character
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function test() {
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/opt/google/chrome/google-chrome')
      ? '/opt/google/chrome/google-chrome'
      : undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  const fileUrl = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.resolve(__dirname, 'screenshot_test_gltf.png') });
  console.log('Saved screenshot_test_gltf.png');

  await browser.close();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});

