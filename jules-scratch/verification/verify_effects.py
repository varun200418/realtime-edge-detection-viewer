from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:5173", timeout=60000)

            # Click "Start Camera"
            page.get_by_role("button", name="Start Camera").click()

            # Wait for the image to be rendered
            image_locator = page.locator("div.relative > img")
            expect(image_locator).to_be_visible(timeout=15000)

            # Switch to "Processed" view
            page.get_by_role("button", name="Show Processed").click()

            # Select the "Color Channel" effect
            page.get_by_role("combobox").select_option("Color Channel")

            # Select the "GREEN" color channel
            page.get_by_role("radio", name="GREEN").click()

            # Allow time for the effect to be applied
            page.wait_for_timeout(1000)

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/verification.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()