# -------- BUILD STAGE --------
FROM node:20-alpine AS build

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code
COPY . .

# build frontend
RUN npm run build

# -------- RUN STAGE --------
FROM nginx:alpine

# copy build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# expose nginx port
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]

