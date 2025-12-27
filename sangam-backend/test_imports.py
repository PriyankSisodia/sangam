#!/usr/bin/env python
"""Quick test script to verify all imports work"""

try:
    from main import app
    print("✅ Main app imports successfully")
    print(f"\n📋 Available routes ({len(app.routes)} total):")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ', '.join(route.methods) if route.methods else '*'
            print(f"  {methods:15} {route.path}")
    print("\n✅ All imports successful! Backend is ready to run.")
    print("\n🚀 Start server with: uvicorn main:app --reload")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

