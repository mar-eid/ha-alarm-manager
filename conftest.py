"""Root conftest that patches Unix-only modules on Windows."""

import sys
import types

# On Windows, mock Unix-only modules that homeassistant.runner imports.
# These are not available on Windows but are needed for pytest-homeassistant-custom-component
# to load the HA test harness.
if sys.platform == "win32":
    if "fcntl" not in sys.modules:
        sys.modules["fcntl"] = types.ModuleType("fcntl")

    if "resource" not in sys.modules:
        _resource = types.ModuleType("resource")
        _resource.RLIMIT_NOFILE = 7  # type: ignore[attr-defined]
        _resource.getrlimit = lambda x: (1024, 1024)  # type: ignore[attr-defined]
        _resource.setrlimit = lambda x, y: None  # type: ignore[attr-defined]
        sys.modules["resource"] = _resource
