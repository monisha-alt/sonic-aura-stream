# Dockerfile for Hugging Face Spaces deployment
# Uses Python 3.11 with system dependencies for audio processing

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio processing
# ffmpeg: for audio format conversion
# libsndfile1: for soundfile library to read/write audio files
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first (for better Docker layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY wav2vec2-ravdess-emotion ./wav2vec2-ravdess-emotion

# Hugging Face Spaces provides PORT environment variable (default: 7860)
# Our app.py already reads from PORT env var, so no changes needed
ENV PORT=7860

# Set Hugging Face cache directory to writable location
# Note: TRANSFORMERS_CACHE is deprecated, using HF_HOME only
ENV HF_HOME=/tmp/huggingface_cache

# Expose the port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Run the FastAPI application
# The app.py already uses PORT from environment variable
CMD ["python", "app.py"]

