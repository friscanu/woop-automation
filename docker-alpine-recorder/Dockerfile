FROM alpine:latest

RUN apk add --no-cache \
    gnome-terminal \
    dbus \
    dbus-x11 \
    xvfb \
    bash \
    ttf-freefont \
    ffmpeg \
    coreutils \
    util-linux \
    pciutils \
    usbutils \
    ncurses \
    imagemagick \
    feh \
    xsetroot \
    dconf \
    xdotool \
    nodejs \
    npm \
    jq

WORKDIR /app

COPY package.json .
RUN npm install

COPY docker-shell-recorder.sh /docker-shell-recorder.sh
RUN chmod +x /docker-shell-recorder.sh

RUN mkdir -p /output /output/logs && chmod 777 /output /output/logs

ENV TERM=xterm-256color

CMD ["/docker-shell-recorder.sh"]
