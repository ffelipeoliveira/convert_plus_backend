FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# pdf2docx (para PDF -> DOCX)
RUN pip install --no-cache-dir pdf2docx

WORKDIR /app

COPY convert_pdf2docx.py /app/convert_pdf2docx.py

CMD ["/bin/bash"]