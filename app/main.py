import subprocess
import uvicorn
import os
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.exceptions import setup_exception_handlers
from contextlib import asynccontextmanager
import app.core.logging as logging

logging.setup_logging()

app = FastAPI(title="CodeHub",docs_url=None)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "..", "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/docs", include_in_schema=False)
async def custom_docs():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Docs",
        swagger_js_url="/static/swagger/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger/swagger-ui.css",
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# register handlers
setup_exception_handlers(app)
# Include routers
app.include_router(api_router, prefix="/api/v1")
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
