"""
pages/login_page.py - Page Object encapsulating SmartNest login elements and actions.
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SmartNestLoginPage:
    # --- Element Locators (from SmartNest React Frontend) ---
    NAV_SIGN_IN_BTN   = (By.XPATH, "//header//button[contains(., 'Sign In') or contains(text(), 'Sign In')]")
    MODAL_CONTAINER   = (By.XPATH, "//h3[contains(text(), 'Sign in to SmartNest')]/ancestor::div[contains(@class, 'relative')]")
    EMAIL_INPUT       = (By.ID, "email-address")
    PASSWORD_INPUT    = (By.ID, "password")
    SUBMIT_BUTTON     = (By.CSS_SELECTOR, "form button[type='submit']")
    ROLE_BADGE        = (By.XPATH, "//header//div[contains(@class, 'border-l')]")
    SIGN_OUT_BUTTON   = (By.XPATH, "//button[@title='Sign out' or contains(@title, 'Sign out')]")
    ERROR_TOAST       = (By.CSS_SELECTOR, "div.fixed.bottom-4.right-4 div")
    MODAL_CLOSE_BTN   = (By.XPATH, "//button[contains(text(), '✕') or contains(@class, 'rounded-full')]")

    def __init__(self, driver, base_url="http://localhost:3000"):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def load(self):
        """Navigates to the SmartNest homepage and resets state."""
        self.driver.get(self.base_url)
        try:
            self.driver.execute_script("localStorage.clear(); sessionStorage.clear();")
            self.driver.refresh()
        except Exception:
            pass

    def open_login_modal(self):
        """Clicks the Sign In button in navigation header to open the login modal."""
        btn = self.wait.until(EC.element_to_be_clickable(self.NAV_SIGN_IN_BTN))
        btn.click()
        self.wait.until(EC.visibility_of_element_located(self.EMAIL_INPUT))

    def enter_email(self, email: str):
        """Clears and types into the email input field."""
        field = self.wait.until(EC.visibility_of_element_located(self.EMAIL_INPUT))
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.BACKSPACE)
        if email:
            field.send_keys(email)

    def enter_password(self, password: str):
        """Clears and types into the password input field."""
        field = self.wait.until(EC.visibility_of_element_located(self.PASSWORD_INPUT))
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.BACKSPACE)
        if password:
            field.send_keys(password)

    def click_submit(self):
        """Clicks the modal submit button."""
        submit = self.wait.until(EC.element_to_be_clickable(self.SUBMIT_BUTTON))
        submit.click()

    def login(self, email: str, password: str):
        """Convenience method to execute a complete login sequence."""
        self.open_login_modal()
        self.enter_email(email)
        self.enter_password(password)
        self.click_submit()

    def get_role_badge_text(self) -> str:
        """Retrieves user role string from the header badge after successful authentication."""
        badge = self.wait.until(EC.visibility_of_element_located(self.ROLE_BADGE))
        text = self.driver.execute_script("return arguments[0].innerText;", badge)
        return (text or badge.text).strip()

    def get_error_message(self) -> str:
        """Retrieves text from the floating error toast notification."""
        toast = self.wait.until(EC.visibility_of_element_located(self.ERROR_TOAST))
        return toast.text.strip()

    def logout(self):
        """Clicks the Sign Out button in the header."""
        logout_btn = self.wait.until(EC.element_to_be_clickable(self.SIGN_OUT_BUTTON))
        logout_btn.click()
        self.wait.until(EC.element_to_be_clickable(self.NAV_SIGN_IN_BTN))

    def is_sign_in_button_visible(self) -> bool:
        """Checks if the Sign In button is present in the header."""
        elements = self.driver.find_elements(*self.NAV_SIGN_IN_BTN)
        return len(elements) > 0 and elements[0].is_displayed()
