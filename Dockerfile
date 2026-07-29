FROM m.daocloud.io/docker.io/library/golang:1.26.5-alpine3.23@sha256:622e56dbc11a8cfe87cafa2331e9a201877271cbff918af53d3be315f3da88cc AS test
WORKDIR /src
COPY go.mod main.go main_test.go ./
RUN go test ./...

FROM test AS build
ARG APP_VERSION=dev
ARG VCS_REF=unknown
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath \
    -ldflags="-s -w -X main.version=${APP_VERSION} -X main.commit=${VCS_REF}" \
    -o /out/m6-release-fixture .

FROM scratch AS runtime
ARG APP_VERSION=dev
ARG VCS_REF=unknown
ARG IMAGE_TAG=unknown
LABEL org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.ref.name="${IMAGE_TAG}"
USER 65532:65532
COPY --from=build /out/m6-release-fixture /m6-release-fixture
EXPOSE 8080
ENTRYPOINT ["/m6-release-fixture"]
