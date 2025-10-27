FROM node:18-alpine

WORKDIR /app

# Install bash for wait-for-it.sh
RUN apk add --no-cache bash 

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Make script executable
# Normalize line endings (CRLF -> LF) and make executable
RUN sed -i 's/\r$//' wait-for-it.sh && chmod +x wait-for-it.sh

EXPOSE 3000

# ✅ Fixed CMD - use shell form and correct argument syntax
CMD ./wait-for-it.sh db:3306 --timeout=60 -- npm start