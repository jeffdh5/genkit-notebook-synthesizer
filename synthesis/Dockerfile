FROM node:18-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

# Copy everything at once
COPY . .

# Install and build
RUN npm install
RUN npm run build

# Cloud Run will use PORT environment variable
EXPOSE 8080

CMD [ "npm", "start" ] 