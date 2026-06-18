import re
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        # Launching with headless=False so you can see the interaction
        # --start-maximized is a browser launch argument
        browser = p.chromium.launch(
            headless=False, 
            args=['--start-maximized']
        )

        # Using a browser context for advanced configurations
        # viewport=None is required for --start-maximized to take effect
        context = browser.new_context(
            viewport=None,
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        )

        page = context.new_page()

        try:
            print('[LOG] Navigating to Facebook...')
            
            # Navigate and wait for the network to settle
            page.goto('https://www.facebook.com', wait_until='networkidle', timeout=60000)

            # Advanced: Handle common Cookie Consent overlays
            # We use a case-insensitive regex to match various button labels
            cookie_button = page.get_by_role(
                'button', 
                name=re.compile(r"Allow all cookies|Accept All|Allow Essential and Optional Cookies", re.IGNORECASE)
            )
            
            if cookie_button.is_visible():
                print('[LOG] Handling cookie consent banner...')
                cookie_button.click()

            # Keep the browser open until manual termination
            print('\n[INFO] Facebook is loaded. Press ENTER in this terminal to close the browser...')
            input("") 

        except Exception as e:
            print(f'[ERROR] An error occurred: {e}')
        finally:
            print('[LOG] Closing browser...')
            browser.close()

if __name__ == '__main__':
    run()