#!/bin/sh
set -eu
set +x

step_key="${1:-}"
step_status="${2:-}"

case "${step_key}" in
  CHECKOUT|TEST|BUILD|PUSH|MIGRATE|PREPARE|HELM_UPGRADE|ROLLOUT|SMOKE|ROLLBACK) ;;
  *) exit 2 ;;
esac
case "${step_status}" in
  RUNNING|SUCCEEDED|FAILED|SKIPPED) ;;
  *) exit 2 ;;
esac

: "${CALLBACK_BASE_URL:?}"
: "${RELEASE_ID:?}"
: "${BUILD_NUMBER:?}"
: "${BUILD_URL:?}"
: "${JENKINS_CALLBACK_SECRET:?}"

read_metadata() {
  current="$1"
  path="$2"
  if [ -n "${current}" ] || [ ! -f "${path}" ]; then
    printf '%s' "${current}"
    return
  fi
  tr -d '\r\n' < "${path}"
}

RELEASE_GIT_COMMIT="$(read_metadata "${RELEASE_GIT_COMMIT:-}" .release-git-commit)"
RELEASE_IMAGE_TAG="$(read_metadata "${RELEASE_IMAGE_TAG:-}" .release-image-tag)"
RELEASE_IMAGE_DIGEST="$(read_metadata "${RELEASE_IMAGE_DIGEST:-}" .product-image-digest)"
RELEASE_HELM_REVISION="$(read_metadata "${RELEASE_HELM_REVISION:-}" .helm-revision)"

case "${CALLBACK_BASE_URL}" in
  http://*.svc.cluster.local:*|https://*) ;;
  *) exit 2 ;;
esac
case "${RELEASE_ID}:${BUILD_NUMBER}" in
  *[!0-9:]*|:*|*:) exit 2 ;;
esac

validate_optional() {
  value="$1"
  pattern="$2"
  if [ -n "${value}" ] && ! printf '%s' "${value}" | grep -Eq "${pattern}"; then
    exit 2
  fi
}

validate_optional "${RELEASE_GIT_COMMIT:-}" '^[a-f0-9]{40}$'
validate_optional "${RELEASE_IMAGE_TAG:-}" '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'
validate_optional "${RELEASE_IMAGE_DIGEST:-}" '^sha256:[a-f0-9]{64}$'
validate_optional "${RELEASE_HELM_REVISION:-}" '^[1-9][0-9]*$'

body_file="$(mktemp)"
canonical_file="$(mktemp)"
trap 'rm -f "${body_file}" "${canonical_file}"' EXIT

printf '{"status":"%s","buildNumber":%s,"buildUrl":"%s"' \
  "${step_status}" "${BUILD_NUMBER}" "${BUILD_URL}" > "${body_file}"
if [ -n "${RELEASE_GIT_COMMIT:-}" ]; then
  printf ',"gitCommitSha":"%s"' "${RELEASE_GIT_COMMIT}" >> "${body_file}"
fi
if [ -n "${RELEASE_IMAGE_TAG:-}" ]; then
  printf ',"imageTag":"%s"' "${RELEASE_IMAGE_TAG}" >> "${body_file}"
fi
if [ -n "${RELEASE_IMAGE_DIGEST:-}" ]; then
  printf ',"imageDigest":"%s"' "${RELEASE_IMAGE_DIGEST}" >> "${body_file}"
fi
if [ -n "${RELEASE_HELM_REVISION:-}" ]; then
  printf ',"helmRevision":%s' "${RELEASE_HELM_REVISION}" >> "${body_file}"
fi
printf '}' >> "${body_file}"

timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
nonce="$(cat /proc/sys/kernel/random/uuid)"
callback_path="/internal/v1/jenkins/releases/${RELEASE_ID}/steps/${step_key}"
body_hash="$(openssl dgst -sha256 "${body_file}" | awk '{print $NF}')"
printf '%s\n%s\nPOST\n%s\n%s' \
  "${timestamp}" "${nonce}" "${callback_path}" "${body_hash}" > "${canonical_file}"
signature="$(openssl dgst -sha256 -hmac "${JENKINS_CALLBACK_SECRET}" -binary "${canonical_file}" |
  od -An -vtx1 | tr -d ' \n')"

curl --silent --show-error --fail \
  --connect-timeout 5 --max-time 15 \
  -H "Content-Type: application/json" \
  -H "X-Jenkins-Timestamp: ${timestamp}" \
  -H "X-Jenkins-Nonce: ${nonce}" \
  -H "X-Jenkins-Signature: sha256=${signature}" \
  --data-binary "@${body_file}" \
  "${CALLBACK_BASE_URL}${callback_path}" >/dev/null

