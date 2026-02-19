from playwright.sync_api import sync_playwright
import time

def verify_profile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile-ish and desktop viewport to check responsiveness
        for width in [1280, 400]:
            page = browser.new_page(viewport={"width": width, "height": 800})
            try:
                page.goto("http://localhost:5173", timeout=30000)
                # Wait for boot sequence to finish
                time.sleep(5)

                # Check if profile is visible
                profile = page.locator(".col-profile")
                if profile.is_visible():
                    page.screenshot(path=f"/home/jules/profile_{width}.png")
                    print(f"Screenshot taken for width {width}")
                else:
                    print("Profile column not visible (maybe mobile view handled differently?)")
                    # In mobile view, profile might be hidden or stacked.
                    # If stacked, it should be visible.
                    # Let's screenshot the whole page.
                    page.screenshot(path=f"/home/jules/page_{width}.png")

            except Exception as e:
                print(f"Error: {e}")
            finally:
                page.close()
        browser.close()

if __name__ == "__main__":
    verify_profile()
