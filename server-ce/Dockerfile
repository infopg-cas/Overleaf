# ---------------------------------------------
# Overleaf Community Edition (overleaf/overleaf)
# ---------------------------------------------

# 可以使用 registry.cn-beijing.aliyuncs.com/wltsz/sharelatex-base:v0.0.1 这个包
# 也可以使用官方提供的 sharelatex/sharelatex-base 包
FROM registry.cn-beijing.aliyuncs.com/wltsz/sharelatex-base:v0.0.1

WORKDIR /overleaf

# Add required source files
# -------------------------
ADD server-ce/genScript.js /overleaf/genScript.js
ADD server-ce/services.js /overleaf/services.js
ADD package.json package-lock.json /overleaf/
ADD libraries/ /overleaf/libraries/
ADD services/ /overleaf/services/

# Add npm patches
# -----------------------
ADD patches/ /overleaf/patches

ENV http_proxy http://192.168.110.105:10809
ENV https_proxy http://192.168.110.105:10809

# Install npm dependencies
# ------------------------
RUN node genScript install | bash

# Compile
# --------------------
RUN node genScript compile | bash

# Copy runit service startup scripts to its location
# --------------------------------------------------
ADD server-ce/runit /etc/service

# Copy runit global settings to its location
# ------------------------------------------
ADD server-ce/config/env.sh /etc/overleaf/env.sh

# Configure nginx
# ---------------
ADD server-ce/nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template
ADD server-ce/nginx/overleaf.conf /etc/nginx/sites-enabled/overleaf.conf
ADD server-ce/nginx/clsi-nginx.conf /etc/nginx/sites-enabled/clsi-nginx.conf


# Configure log rotation
# ----------------------
ADD server-ce/logrotate/overleaf /etc/logrotate.d/overleaf
RUN chmod 644 /etc/logrotate.d/overleaf

# Configure cron tasks
# ----------------------
ADD server-ce/cron /overleaf/cron
ADD server-ce/config/crontab-history /etc/cron.d/crontab-history
RUN chmod 600 /etc/cron.d/crontab-history
ADD server-ce/config/crontab-deletion /etc/cron.d/crontab-deletion
RUN chmod 600 /etc/cron.d/crontab-deletion

# Copy Phusion Image startup and shutdown scripts to their locations
# ------------------------------------------------------------------
COPY server-ce/init_scripts/ /etc/my_init.d/
COPY server-ce/init_preshutdown_scripts/ /etc/my_init.pre_shutdown.d/

# Copy app settings files
# -----------------------
COPY server-ce/config/settings.js /etc/overleaf/settings.js

# Copy history-v1 files
# -----------------------
COPY server-ce/config/production.json /overleaf/services/history-v1/config/production.json
COPY server-ce/config/custom-environment-variables.json /overleaf/services/history-v1/config/custom-environment-variables.json

# Copy grunt thin wrapper
# -----------------------
ADD server-ce/bin/grunt /usr/local/bin/grunt
RUN chmod +x /usr/local/bin/grunt

# Copy history helper scripts
# ---------------------------
ADD server-ce/bin/flush-history-queues /overleaf/bin/flush-history-queues
RUN chmod +x /overleaf/bin/flush-history-queues
ADD server-ce/bin/force-history-resyncs /overleaf/bin/force-history-resyncs
RUN chmod +x /overleaf/bin/force-history-resyncs

# File that controls open|closed status of the site
# -------------------------------------------------
ENV SITE_MAINTENANCE_FILE "/etc/overleaf/site_status"
RUN touch $SITE_MAINTENANCE_FILE

# Set Environment Variables
# --------------------------------
ENV OVERLEAF_CONFIG /etc/overleaf/settings.js

ENV WEB_API_USER "overleaf"
ENV ADMIN_PRIVILEGE_AVAILABLE "true"

ENV OVERLEAF_APP_NAME "Overleaf Community Edition"

ENV OPTIMISE_PDF "true"

# Phusion Image timeouts before sending SIGKILL to processes
# ----------------------------------------------------------
ENV KILL_PROCESS_TIMEOUT 55
ENV KILL_ALL_PROCESSES_TIMEOUT 55
ENV GRACEFUL_SHUTDOWN_DELAY_SECONDS 1

ENV NODE_ENV "production"
ENV LOG_LEVEL "info"


EXPOSE 80

ENTRYPOINT ["/sbin/my_init"]

# Store the revision
# ------------------
# This should be the last step to optimize docker image caching.
ARG MONOREPO_REVISION
RUN echo "monorepo-server-ce,$MONOREPO_REVISION" > /var/www/revisions.txt
