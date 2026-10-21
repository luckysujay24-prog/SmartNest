"""
conftest.py - Pytest fixtures and driver setup for SmartNest automation.
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions

BASE_URL = "http://localhost:3000"

@pytest.fixture(scope="function")
def driver():
    """
    Initializes a Chrome WebDriver instance before each test function
    and cleanly terminates the browser session upon test completion.
    """
    options = ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-notifications")
    # Uncomment the following line to run tests in headless mode:
    # options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(2)  # Fallback wait
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def base_url():
    """Returns the base target URL for the SmartNest application."""
    return BASE_URL
