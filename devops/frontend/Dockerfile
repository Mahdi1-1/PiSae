# Ce Dockerfile est construit avec le contexte à la racine du repo
# (docker build -f devops/frontend/Dockerfile .), pour pouvoir COPY à la fois
# new-front/ et devops/frontend/nginx.conf sans les dupliquer ailleurs.

# ---------- Stage 1 : build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY new-front/package*.json ./
RUN npm ci
COPY new-front/. .
RUN npm run build -- --configuration production

# ---------- Stage 2 : runtime (nginx) ----------
FROM nginx:1.27-alpine
# Le projet Angular s'appelle "FoundersLab" (voir angular.json) : la nouvelle
# builder application produit dist/FoundersLab/browser, pas dist/new-front.
COPY --from=build /app/dist/FoundersLab/browser /usr/share/nginx/html
COPY devops/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
