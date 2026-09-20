# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN npm ci

COPY . .

# Vazio = same-origin: o navegador chama a propria origem e o nginx faz o proxy
# (ver nginx.conf.template). Nunca ponha chave de API em ARG/ENV VITE_*: vai
# para o bundle e e publica.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# So para a instancia de curadoria em DEV (vai para o bundle, publica). Nunca
# em imagem de producao: deixe vazio.
ARG VITE_API_KEY=
ENV VITE_API_KEY=$VITE_API_KEY

# full (todas as rotas) | expert (so /avaliacao/*). Ver README.
ARG VITE_APP_MODE=full
ENV VITE_APP_MODE=$VITE_APP_MODE

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# O entrypoint da imagem roda envsubst em /etc/nginx/templates/*.template e
# grava em /etc/nginx/conf.d/. Como so API_UPSTREAM interessa, restringimos a
# substituicao a ela para nao tocar nas variaveis do proprio nginx ($uri etc.).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$
ENV API_UPSTREAM=http://phishforge-api:8000

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
