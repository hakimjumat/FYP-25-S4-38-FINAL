FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
# Use "exec" to ensure the signal is passed correctly to the process
CMD exec uvicorn analytics:app --host 0.0.0.0 --port $PORT