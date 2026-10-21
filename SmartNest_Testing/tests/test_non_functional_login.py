"""
tests/test_non_functional_login.py - Non-functional test suite for SmartNest login.
"""
import time
import pytest
from selenium.webdriver.common.keys import Keys
from pages.login_page import SmartNestLoginPage

TENANT_EMAIL = "ananya.tenant@example.com"
PASSWORD     = "password123"

def test_nf01_usability_labels_and_placeholders(driver, base_url):
    """NF01: Usability - Check field labels, placeholders, and button text."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    email_field = driver.find_element(*page.EMAIL_INPUT)
    submit_btn = driver.find_element(*page.SUBMIT_BUTTON)
    assert email_field.get_attribute("placeholder") != ""
    assert "Sign In" in submit_btn.text

def test_nf02_performance_login_response_time(driver, base_url):
    """NF02: Performance - Measure local login response time."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    page.enter_email(TENANT_EMAIL)
    page.enter_password(PASSWORD)
    
    start_time = time.time()
    page.click_submit()
    page.get_role_badge_text()
    elapsed_time = time.time() - start_time
    
    assert elapsed_time < 3.0, f"Login took too long: {elapsed_time:.2f}s"

def test_nf03_reliability_consecutive_sessions(driver, base_url):
    """NF03: Reliability - Verify 3 consecutive login/logout cycles."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    for cycle in range(3):
        page.login(TENANT_EMAIL, PASSWORD)
        assert "TENANT" in page.get_role_badge_text().upper()
        page.logout()
        assert page.is_sign_in_button_visible()

def test_nf04_security_dom_password_masking(driver, base_url):
    """NF04: Security - Verify password is masked via input type attribute."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    pass_element = driver.find_element(*page.PASSWORD_INPUT)
    assert pass_element.get_attribute("type") == "password"

def test_nf05_accessibility_keyboard_tab_traversal(driver, base_url):
    """NF05: Accessibility - Verify keyboard navigation order with TAB key."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    
    email_field = driver.find_element(*page.EMAIL_INPUT)
    email_field.click()
    email_field.send_keys(Keys.TAB)
    
    active_element = driver.switch_to.active_element
    assert active_element.get_attribute("id") == "password"
