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
    jq \
    python3 \
    py3-pip \
    netcat-openbsd
    
WORKDIR /app

COPY package.json .
RUN npm install

COPY shell_recorder.sh /shell_recorder.sh
COPY command_verifier.py /app/command_verifier.py
RUN chmod +x /shell_recorder.sh

# Create and activate a virtual environment, install websocket-client
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install websocket-client

# Set up chroot environment with selective filesystem mirror
RUN mkdir -p /app/chroot && \
    # Copy essential top-level dirs, excluding volatile ones
    for dir in bin etc lib sbin usr; do cp -a "/${dir}" /app/chroot/; done && \
    # Recreate volatile dirs
    mkdir -p /app/chroot/dev /app/chroot/proc /app/chroot/sys /app/chroot/tmp /app/chroot/var/cache/apk && \
    chmod -R 755 /app/chroot && \
    chmod 1777 /app/chroot/tmp && \
    # Log setup
    echo "Chroot environment initialized with selective filesystem mirror" > /app/chroot_setup.log

RUN mkdir -p /output /output/logs && chmod 777 /output /output/logs

ENV TERM=xterm-256color

CMD ["/bin/bash", "/shell_recorder.sh"]