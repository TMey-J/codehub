FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for spaCy
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --no-cache-dir .[dev]

# Download spaCy model
RUN python -m spacy download en_core_web_sm

COPY src/ ./src/

ENV PYTHONPATH=/app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
