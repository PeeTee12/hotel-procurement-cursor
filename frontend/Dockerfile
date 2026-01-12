FROM node:20-alpine

WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
