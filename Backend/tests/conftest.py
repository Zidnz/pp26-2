import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[2]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))


@pytest.fixture(scope="session")
def cliente():
    from fastapi.testclient import TestClient

    from Backend.app.main import app
    return TestClient(app)
