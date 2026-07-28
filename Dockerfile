FROM 192.168.5.5:18500/apps/app-2/fixture-api@sha256:930358aa53e77dc76ec937782fa3be0ff6fc6191f5deeb9e0639778c41af7af3
ARG APP_VERSION=dev
ARG VCS_REF=unknown
ARG IMAGE_TAG=unknown
LABEL org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.ref.name="${IMAGE_TAG}"
