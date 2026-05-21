import puppeteer from 'puppeteer';

async function run() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  
  console.log("Navigating to http://localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("Scrolling to #process...");
  await page.evaluate(() => {
    const el = document.getElementById('process');
    if (el) el.scrollIntoView();
  });
  
  console.log("Waiting for animations...");
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: '/Users/lui/Desktop/Projects/KTM DECOR F/process-screenshot.png' });
  console.log("Screenshot saved to /Users/lui/Desktop/Projects/KTM DECOR F/process-screenshot.png");
  
  await browser.close();
}

run().catch(console.error);
