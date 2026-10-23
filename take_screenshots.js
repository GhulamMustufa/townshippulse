const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = path.join(__dirname, "public", "screenshots");
const ROOT_SCREENSHOT_DIR = path.join(__dirname, "screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
if (!fs.existsSync(ROOT_SCREENSHOT_DIR)) {
  fs.mkdirSync(ROOT_SCREENSHOT_DIR, { recursive: true });
}

async function copyToBoth(srcName) {
  const p1 = path.join(SCREENSHOT_DIR, srcName);
  const p2 = path.join(ROOT_SCREENSHOT_DIR, srcName);
  if (fs.existsSync(p1)) {
    fs.copyFileSync(p1, p2);
  }
}

async function run() {
  console.log("🚀 Launching Playwright with system Google Chrome...");
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  // --------------------------------------------------------------------------
  // DESKTOP FLOWS (1440 x 900)
  // --------------------------------------------------------------------------
  console.log("📸 Capturing Desktop Flows (1440x900)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina 2x high resolution
  });
  const page = await desktopContext.newPage();

  // 1. Command Center Desktop - City of Elmina
  console.log("  -> 01_command_center_desktop.png");
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000); // allow Leaflet tiles to load
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_command_center_desktop.png") });
  copyToBoth("01_command_center_desktop.png");

  // 2. Multi-Township Switcher - Bandar Bukit Raja
  console.log("  -> 02_multi_township_gliding.png");
  // Select Bandar Bukit Raja in dropdown
  await page.selectOption('header select', 'Bandar Bukit Raja');
  await page.waitForTimeout(2500); // allow camera to fly across Selangor
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_multi_township_gliding.png") });
  copyToBoth("02_multi_township_gliding.png");

  // Switch back to City of Elmina
  await page.selectOption('header select', 'City of Elmina');
  await page.waitForTimeout(2000);

  // 3. Work Order Modal - Incident Details & JKR Rates
  console.log("  -> 03_work_order_rates_modal.png");
  const firstIncidentCard = page.locator('.overflow-y-auto .cursor-pointer').first();
  await firstIncidentCard.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_work_order_rates_modal.png") });
  copyToBoth("03_work_order_rates_modal.png");

  // 4. Contractor AI Audit Tab (Before vs After)
  console.log("  -> 04_contractor_ai_audit_tab.png");
  const auditTabBtn = page.locator('button:has-text("Contractor AI Audit")');
  await auditTabBtn.click();
  await page.waitForTimeout(800);
  // Trigger AI audit verification button if available
  const verifyBtn = page.locator('button:has-text("Run AI Resolution Verification")');
  if (await verifyBtn.isVisible()) {
    await verifyBtn.click();
    await page.waitForTimeout(2200); // Wait for verification animation to resolve
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_contractor_ai_audit_tab.png") });
  copyToBoth("04_contractor_ai_audit_tab.png");

  // 5. Printable JKR Form (Borang Pesanan Kerja JKR)
  console.log("  -> 05_printable_jkr_form.png");
  const jkrFormTabBtn = page.locator('button:has-text("Print JKR Form")');
  await jkrFormTabBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_printable_jkr_form.png") });
  copyToBoth("05_printable_jkr_form.png");

  // Close Modal
  const closeBtn = page.locator('button:has-text("Close")').first();
  await closeBtn.click();
  await page.waitForTimeout(500);

  // 6. WhatsApp Bot Simulator
  console.log("  -> 06_whatsapp_bot_simulator.png");
  const waBtn = page.locator('button[title*="WhatsApp"]');
  await waBtn.click();
  await page.waitForTimeout(800);
  // Click a quick chip to send a complaint
  const waChip = page.locator('button:has-text("Clogged Drain")');
  await waChip.click();
  await page.waitForTimeout(2500); // Wait for real /api/copilot reply
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_whatsapp_bot_simulator.png") });
  copyToBoth("06_whatsapp_bot_simulator.png");

  // Close WhatsApp
  const waCloseBtn = page.locator('.fixed.z-50 button:has(svg)').first();
  if (await waCloseBtn.isVisible()) {
    await waCloseBtn.click();
    await page.waitForTimeout(500);
  }

  // 7. Judge QR Code Modal
  console.log("  -> 07_judge_qr_modal.png");
  const qrBtn = page.locator('button:has-text("Judge Demo")');
  await qrBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_judge_qr_modal.png") });
  copyToBoth("07_judge_qr_modal.png");
  await desktopContext.close();

  // --------------------------------------------------------------------------
  // MOBILE FLOWS (iPhone 14: 390 x 844)
  // --------------------------------------------------------------------------
  console.log("📱 Capturing Mobile Flows (iPhone 14: 390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // 8. Mobile Command Center - Map View
  console.log("  -> 08_mobile_command_center_map.png");
  await mobilePage.goto("http://localhost:3001/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, "08_mobile_command_center_map.png") });
  copyToBoth("08_mobile_command_center_map.png");

  // 9. Mobile Command Center - Feed View
  console.log("  -> 09_mobile_command_center_feed.png");
  const feedTabBtn = mobilePage.locator('button:has-text("Live Feed")');
  await feedTabBtn.click();
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, "09_mobile_command_center_feed.png") });
  copyToBoth("09_mobile_command_center_feed.png");

  // 10. Mobile Resident Reporter (/report)
  console.log("  -> 10_mobile_reporter_page.png");
  await mobilePage.goto("http://localhost:3001/report", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, "10_mobile_reporter_page.png") });
  copyToBoth("10_mobile_reporter_page.png");

  // 11. Mobile Reporter - Submitted Live Result Card
  console.log("  -> 11_mobile_reporter_submitted_result.png");
  const submitBtn = mobilePage.locator('button[type="submit"]');
  await submitBtn.click();
  await mobilePage.waitForTimeout(3000); // Wait for real /api/copilot response card
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, "11_mobile_reporter_submitted_result.png") });
  copyToBoth("11_mobile_reporter_submitted_result.png");
  await mobileContext.close();

  // --------------------------------------------------------------------------
  // PRESENTATION SLIDES (1440 x 900)
  // --------------------------------------------------------------------------
  console.log("📊 Capturing Interactive Presentation Slides...");
  const slidesContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const slidesPage = await slidesContext.newPage();
  await slidesPage.goto("http://localhost:3001/interactive_slides.html", { waitUntil: "networkidle" });
  await slidesPage.waitForTimeout(1000);

  // Slide 1: Cover
  console.log("  -> 12_slide_1_cover.png");
  await slidesPage.screenshot({ path: path.join(SCREENSHOT_DIR, "12_slide_1_cover.png") });
  copyToBoth("12_slide_1_cover.png");

  // Slide 2: Problem
  console.log("  -> 13_slide_2_problem.png");
  await slidesPage.keyboard.press("ArrowRight");
  await slidesPage.waitForTimeout(600);
  await slidesPage.screenshot({ path: path.join(SCREENSHOT_DIR, "13_slide_2_problem.png") });
  copyToBoth("13_slide_2_problem.png");

  // Slide 3: Solution
  console.log("  -> 14_slide_3_solution.png");
  await slidesPage.keyboard.press("ArrowRight");
  await slidesPage.waitForTimeout(600);
  await slidesPage.screenshot({ path: path.join(SCREENSHOT_DIR, "14_slide_3_solution.png") });
  copyToBoth("14_slide_3_solution.png");

  // Slide 4: Live Demo Flow
  console.log("  -> 15_slide_4_live_demo.png");
  await slidesPage.keyboard.press("ArrowRight");
  await slidesPage.waitForTimeout(600);
  await slidesPage.screenshot({ path: path.join(SCREENSHOT_DIR, "15_slide_4_live_demo.png") });
  copyToBoth("15_slide_4_live_demo.png");

  // Slide 5: Business Numbers & Unit Economics
  console.log("  -> 16_slide_5_business_numbers.png");
  await slidesPage.keyboard.press("ArrowRight");
  await slidesPage.waitForTimeout(600);
  await slidesPage.screenshot({ path: path.join(SCREENSHOT_DIR, "16_slide_5_business_numbers.png") });
  copyToBoth("16_slide_5_business_numbers.png");

  await slidesContext.close();
  await browser.close();

  console.log("✨ All 16 high-resolution screenshots captured successfully!");
}

run().catch((err) => {
  console.error("❌ Screenshot capture failed:", err);
  process.exit(1);
});
