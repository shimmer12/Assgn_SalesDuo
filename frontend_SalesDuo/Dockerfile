# Use a more recent official Node.js runtime for consistency and to meet Vite's requirements.
FROM node:20-alpine

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to ensure dependencies are cached.
COPY package*.json ./

# Install the application dependencies.
RUN npm install

# Copy the rest of your application's source code.
COPY . .

# The frontend dev server runs on port 3000.
EXPOSE 3000

# Command to run the development server.
# We add -- --host 0.0.0.0 --port 3000 to ensure Vite runs on the correct port and is accessible.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

