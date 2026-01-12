import os
import sys
import copy
import pytest

# Ensure src is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from fastapi.testclient import TestClient
import app as app_module

app = app_module.app
activities = app_module.activities

INITIAL = copy.deepcopy(activities)


@pytest.fixture(autouse=True)
def reset_activities():
    activities.clear()
    activities.update(copy.deepcopy(INITIAL))
    yield


client = TestClient(app)


def test_root_redirect():
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code in (301, 302, 307)
    assert resp.headers["location"] == "/static/index.html"


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_success():
    email = "new@student.edu"
    resp = client.post("/activities/Tennis%20Club/signup", params={"email": email})
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")


def test_signup_already_signed():
    # Sarah is already signed up for Tennis Club in initial data
    email = "sarah@mergington.edu"
    resp = client.post("/activities/Tennis%20Club/signup", params={"email": email})
    assert resp.status_code == 400


def test_signup_activity_not_found():
    resp = client.post("/activities/NoSuchActivity/signup", params={"email": "x@y.com"})
    assert resp.status_code == 404


def test_unregister_success():
    # James is initially in Basketball Team
    email = "james@mergington.edu"
    resp = client.delete("/activities/Basketball%20Team/unregister", params={"email": email})
    assert resp.status_code == 200
    assert "Unregistered" in resp.json().get("message", "")


def test_unregister_not_found():
    resp = client.delete("/activities/Basketball%20Team/unregister", params={"email": "noone@x.com"})
    assert resp.status_code == 404


def test_unregister_activity_not_found():
    resp = client.delete("/activities/NoSuchActivity/unregister", params={"email": "x@y.com"})
    assert resp.status_code == 404
