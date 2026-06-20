FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir \
    --index-url https://pypi.org/simple \
    -r requirements.txt

# Copy application code
COPY app ./app

COPY .env .
# Copy static assets
COPY static ./static

# Start API server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2002"]
