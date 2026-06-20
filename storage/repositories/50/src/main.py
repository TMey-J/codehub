from fastapi import FastAPI
from src.api.routes import query, ingestion
from src.api.middleware.auth import AuthMiddleware
from src.config import settings
import structlog
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Structured logging
structlog.configure(processors=[structlog.processors.JSONRenderer()])
logger = structlog.get_logger()

# OpenTelemetry (optional, disabled if no endpoint)
try:
    provider = TracerProvider()
    processor = BatchSpanProcessor(OTLPSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
except Exception:
    pass

app = FastAPI(title="Enterprise RAG", version="1.0.0")
app.add_middleware(AuthMiddleware)

app.include_router(query.router, prefix="/api/v1")
app.include_router(ingestion.router, prefix="/api/v1")

FastAPIInstrumentor.instrument_app(app)

@app.get("/health")
async def health():
    return {"status": "ok"}
