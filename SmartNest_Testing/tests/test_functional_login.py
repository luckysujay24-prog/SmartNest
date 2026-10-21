"""
tests/test_functional_login.py - Functional test suite for SmartNest login.
"""
import pytest
from pages.login_page import SmartNestLoginPage

# Seeded credentials
TENANT_EMAIL = "ananya.tenant@example.com"
ADMIN_EMAIL  = "admin@smartnest.com"
OWNER_EMAIL  = "rajesh.owner@example.com"
PASSWORD     = "password123"

def test_f01_login_modal_loads(driver, base_url):
    """F01: Verify that the Login Modal opens properly."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    assert driver.find_element(*page.EMAIL_INPUT).is_displayed()
    assert driver.find_element(*page.PASSWORD_INPUT).is_displayed()

def test_f02_valid_tenant_login(driver, base_url):
    """F02: Verify successful login with valid Tenant credentials."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(TENANT_EMAIL, PASSWORD)
    role_text = page.get_role_badge_text()
    assert "TENANT" in role_text.upper()

def test_f03_valid_admin_login(driver, base_url):
    """F03: Verify successful login with valid Admin credentials."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(ADMIN_EMAIL, PASSWORD)
    role_text = page.get_role_badge_text()
    assert "ADMIN" in role_text.upper()

def test_f04_valid_owner_login(driver, base_url):
    """F04: Verify successful login with valid Owner credentials."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(OWNER_EMAIL, PASSWORD)
    role_text = page.get_role_badge_text()
    assert "OWNER" in role_text.upper()

def test_f05_invalid_password(driver, base_url):
    """F05: Verify error message when an incorrect password is submitted."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(TENANT_EMAIL, "wrongpassword999")
    error_msg = page.get_error_message()
    assert len(error_msg) > 0

def test_f06_unregistered_email(driver, base_url):
    """F06: Verify error handling for an unregistered email address."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login("unknown_user_99@example.com", "password123")
    error_msg = page.get_error_message()
    assert len(error_msg) > 0

def test_f07_empty_fields_validation(driver, base_url):
    """F07: Verify HTML5 required validation when both fields are empty."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    page.click_submit()
    email_field = driver.find_element(*page.EMAIL_INPUT)
    validation_message = email_field.get_attribute("validationMessage")
    assert validation_message != ""

def test_f08_empty_email_field(driver, base_url):
    """F08: Verify HTML5 required validation when email is blank."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    page.enter_password("password123")
    page.click_submit()
    email_field = driver.find_element(*page.EMAIL_INPUT)
    assert email_field.get_attribute("validationMessage") != ""

def test_f09_empty_password_field(driver, base_url):
    """F09: Verify HTML5 required validation when password is blank."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    page.enter_email("ananya.tenant@example.com")
    page.enter_password("")
    page.click_submit()
    pass_field = driver.find_element(*page.PASSWORD_INPUT)
    assert pass_field.get_attribute("validationMessage") != ""

def test_f10_email_format_validation(driver, base_url):
    """F10: Verify browser email format validation for input lacking '@'."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    page.enter_email("invalidemailformat")
    page.enter_password("password123")
    page.click_submit()
    email_field = driver.find_element(*page.EMAIL_INPUT)
    validation_message = email_field.get_attribute("validationMessage")
    assert validation_message != ""

def test_f11_password_field_masking(driver, base_url):
    """F11: Verify that password input element has type='password'."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.open_login_modal()
    pass_field = driver.find_element(*page.PASSWORD_INPUT)
    assert pass_field.get_attribute("type") == "password"

@pytest.mark.skip(reason="Pending Implementation in current SmartNest UI")
def test_f12_show_hide_password_toggle(driver, base_url):
    """F12: Test show/hide toggle if implemented in future releases."""
    pass

def test_f13_logout_and_subsequent_login(driver, base_url):
    """F13: Verify user can log out and log back in cleanly."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(TENANT_EMAIL, PASSWORD)
    assert "TENANT" in page.get_role_badge_text().upper()
    page.logout()
    assert page.is_sign_in_button_visible()
    # Re-login with another valid role
    page.login(ADMIN_EMAIL, PASSWORD)
    assert "ADMIN" in page.get_role_badge_text().upper()

def test_f14_unauthenticated_protected_route_access(driver, base_url):
    """F14: Verify that unauthenticated visitors see the public landing page."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    assert page.is_sign_in_button_visible()
    badges = driver.find_elements(*page.ROLE_BADGE)
    assert len(badges) == 0

def test_f15_whitespace_trimming(driver, base_url):
    """F15: Verify input handling when email has leading and trailing spaces."""
    page = SmartNestLoginPage(driver, base_url)
    page.load()
    page.login(f"  {TENANT_EMAIL}  ", PASSWORD)
    role_text = page.get_role_badge_text()
    assert "TENANT" in role_text.upper()
