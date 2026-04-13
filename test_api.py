import requests
import pymongo
import time
import sys

# Configurations
BASE_URL = "http://localhost:8011"
DB_URI = "mongodb://127.0.0.1:27017/"
DB_NAME = "Linkit"

# Test Data
TEST_EMAIL = "test_api_runner@example.com"
TEST_USERNAME = "test_runner"
TEST_PASSWORD = "StrongPassword123!"
COLLECTION_NAME = "My API Test Collection"
LINK_URL = "https://example.com"
LINK_TITLE = "Example Site"

# State
jwt_token = ""
collection_id = ""
link_id = ""
user_id = ""

def bg_color_text(text, color):
    colors = {
        "green": "\033[92m",
        "red": "\033[91m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "reset": "\033[0m"
    }
    return f"{colors.get(color, colors['reset'])}{text}{colors['reset']}"

def run_test(name, func):
    try:
        sys.stdout.write(f"Testing {name}... ")
        func()
        sys.stdout.write(bg_color_text("[PASSED]\n", "green"))
    except AssertionError as e:
        sys.stdout.write(bg_color_text(f"[FAILED]\nReason: {e}\n", "red"))
        cleanup()
        sys.exit(1)
    except Exception as e:
        sys.stdout.write(bg_color_text(f"[ERROR]\nException: {e}\n", "red"))
        cleanup()
        sys.exit(1)

def get_headers():
    return {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/json"
    }

# --- Test Functions ---

def test_signup():
    global user_id
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": TEST_EMAIL,
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    })
    
    # Might already exist if previous test failed and didn't clean up
    if res.status_code == 400 and "already exists" in res.text:
       pass
    else:
        assert res.status_code == 201, f"Expected 201, got {res.status_code} ({res.text})"

def test_db_verification_bypass():
    client = pymongo.MongoClient(DB_URI)
    db = client[DB_NAME]
    res = db.users.update_one({"email": TEST_EMAIL}, {"$set": {"emailVerified": True}})
    
    # Grab user_id for cleanup later
    user = db.users.find_one({"email": TEST_EMAIL})
    global user_id
    if user:
        user_id = str(user["_id"])
    assert user is not None, f"User not found in DB! Signup must have silently failed or email mismatch. res: {res.raw_result}"
    client.close()

def test_login():
    global jwt_token
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    data = res.json()
    assert "token" in data, "Token missing from login response"
    jwt_token = data["token"]

def test_me():
    res = requests.get(f"{BASE_URL}/auth/me", headers=get_headers())
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    assert res.json().get("user", {}).get("email") == TEST_EMAIL, "Email mismatch in /auth/me"

def test_create_collection():
    global collection_id
    res = requests.post(f"{BASE_URL}/collections", headers=get_headers(), json={
        "name": COLLECTION_NAME,
        "description": "Created by API runner"
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code} ({res.text})"
    collection_id = res.json()["_id"]

def test_get_collections():
    res = requests.get(f"{BASE_URL}/collections", headers=get_headers())
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    
    colls = res.json()
    assert len(colls) > 0, "No collections returned"
    assert any(c["_id"] == collection_id for c in colls), "Created collection not found in list"

def test_update_collection_visibility():
    # Make it public so we can test like / explore features
    res = requests.patch(f"{BASE_URL}/collections/{collection_id}/visibility", headers=get_headers(), json={
        "visibility": "public"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    assert res.json().get("visibility") == "public", "Visibility update failed"

def test_like_collection():
    res = requests.post(f"{BASE_URL}/collections/{collection_id}/like", headers=get_headers())
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    assert res.json().get("liked") is True, "Failed to like collection"

def test_create_link():
    global link_id
    res = requests.post(f"{BASE_URL}/links/{collection_id}", headers=get_headers(), json={
        "url": LINK_URL,
        "title": LINK_TITLE
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code} ({res.text})"
    link_id = res.json()["_id"]

def test_public_links_view():
    res = requests.get(f"{BASE_URL}/collections/{collection_id}/links") # Optional Auth
    assert res.status_code == 200, f"Expected 200, got {res.status_code} ({res.text})"
    links = res.json()
    assert len(links) > 0, "No links returned for public collection"
    assert links[0]["url"] == LINK_URL, "Link URL mismatch"


# --- Cleanup ---

def cleanup():
    print(bg_color_text("\n--- Initiating Cleanup ---", "yellow"))
    if jwt_token:
        # Delete Link
        if link_id:
            requests.delete(f"{BASE_URL}/links/{link_id}", headers=get_headers())
            print("Deleted Link via API.")
            
        # Delete Collection
        if collection_id:
            requests.delete(f"{BASE_URL}/collections/{collection_id}", headers=get_headers())
            print("Deleted Collection via API.")

    # Always wipe out the user test stub from MongoDB explicitly
    try:
        client = pymongo.MongoClient(DB_URI)
        db = client[DB_NAME]
        db.users.delete_many({"email": TEST_EMAIL})
        db.authtokens.delete_many({}) # sweep stray authtokens for the user if any
        print("Scrubbed test user from Database.")
        client.close()
    except Exception as e:
        print(f"Failed to scrub DB: {e}")

if __name__ == "__main__":
    print(bg_color_text("Starting LinkIt API End-to-End Test Suite", "blue"))
    print("-" * 50)
    
    # Pre-test cleanup just in case previous suite crashed
    cleanup()
    print("-" * 50)
    
    run_test("User Signup Module", test_signup)
    run_test("DB Verification Bypass", test_db_verification_bypass)
    run_test("User Login Module", test_login)
    run_test("User Session (/me)", test_me)
    
    run_test("Create Collection", test_create_collection)
    run_test("Fetch Collections", test_get_collections)
    run_test("Modify Collection Visibility", test_update_collection_visibility)
    run_test("Like Public Collection", test_like_collection)
    
    run_test("Create Link in Collection", test_create_link)
    run_test("Fetch Public Linked View", test_public_links_view)
    
    cleanup()
    print("-" * 50)
    print(bg_color_text("All API tests passed successfully! 🎉", "green"))
    sys.exit(0)
