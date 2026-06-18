const { chromium } = require('playwright');
const readline = require('readline');

/**
 * Creates a promise that resolves only when the user presses 'Enter' in the terminal.
 * This ensures the browser stays open for manual inspection or interaction.
 */
function waitForUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n[INFO] Facebook is loaded. Press ENTER in this terminal to close the browser...');
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });
}

(async () => {
  // Launching with headless: false so you can see the interaction
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'] 
  });

  // Using a browser context allows for advanced configurations like viewport and locale
  const context = await browser.newContext({
    viewport: null, // Setting to null allows the --start-maximized arg to work
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('[LOG] Navigating to Facebook...');
    
    // Navigate with a generous timeout and wait for the network to be idle
    await page.goto('<https://www.facebook.com>', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    // Advanced: Handle common Cookie Consent overlays if they appear
    // We use a regex to match common "Accept All" button text variations
    const cookieButton = page.getByRole('button', { name: /Allow all cookies|Accept All|Allow Essential and Optional Cookies/i });
    
    if (await cookieButton.isVisible()) {
        console.log('[LOG] Handling cookie consent banner...');
        await cookieButton.click();
    }

    // Keep the browser open until manual termination
    await waitForUserInput();

  } catch (error) {
    console.error('[ERROR] An error occurred during the execution:', error);
  } finally {
    console.log('[LOG] Closing browser...');
    await browser.close();
  }
})();
