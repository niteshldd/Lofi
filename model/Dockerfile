FROM pytorch/pytorch:1.9.0-cuda11.1-cudnn8-runtime

WORKDIR /code
COPY . .

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean && rm -rf /var/libapt/lists/*

RUN python -m pip install --no-cache-dir -r requirements.txt