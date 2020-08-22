FROM alpine:3.11.6

ARG node_version=12.15.0-r1

RUN apk add --no-cache \
  nodejs=${node_version} \
  npm=${node_version} \
  nginx=1.16.1-r6 \
  procps=3.3.16-r0

RUN addgroup cardsup \
  && adduser \
  --disabled-password \
  --ingroup cardsup \
  cardsup \
  && addgroup cardsup tty \
  && addgroup nginx tty

RUN rm /etc/nginx/conf.d/default.conf \
  && mkdir -p /app /web /run/nginx \
  && chown cardsup:cardsup \
  /app /web /run/nginx

COPY --chown=cardsup:cardsup app /app
COPY --chown=cardsup:cardsup web /web

WORKDIR /app
RUN /usr/bin/npm install
# TODO: Run some kind of non-dev build
WORKDIR /

COPY --chown=cardsup:cardsup docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=cardsup:cardsup docker/cardsup.conf /etc/nginx/conf.d/cardsup.conf
COPY --chown=cardsup:cardsup docker/startup.sh  /startup.sh

RUN chown cardsup /startup.sh \
  && chmod u+x startup.sh

CMD [ "/startup.sh" ]

