# Stage 1 - Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a separate layer
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# Stage 2 - Runtime
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY server.py .
COPY resume_analyzer_servicer.py .
COPY proto/ ./proto/

# Don't run as root
RUN useradd -m appuser
USER appuser

EXPOSE 50051

CMD ["python", "server.py"]