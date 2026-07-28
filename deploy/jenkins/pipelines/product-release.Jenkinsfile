def sendReleaseCallback(String stepKey, String status) {
  withCredentials([string(
    credentialsId: 'product-release-callback-hmac',
    variable: 'JENKINS_CALLBACK_SECRET'
  )]) {
    sh(
      label: "release callback ${stepKey} ${status}",
      script: "sh deploy/jenkins/scripts/release-callback.sh '${stepKey}' '${status}'"
    )
  }
}

def beginReleaseStep(String stepKey) {
  env.CURRENT_RELEASE_STEP = stepKey
  writeFile(file: '.current-release-step', text: stepKey)
  sendReleaseCallback(stepKey, 'RUNNING')
}

pipeline {
  agent {
    label 'forge-build'
  }

  options {
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
    timeout(time: 45, unit: 'MINUTES')
  }

  environment {
    REGISTRY_CREDENTIAL_ID = 'container-registry'
    CURRENT_RELEASE_STEP = 'PREPARE'
    RELEASE_GIT_COMMIT = ''
    RELEASE_IMAGE_TAG = ''
    RELEASE_IMAGE_DIGEST = ''
    RELEASE_HELM_REVISION = ''
  }

  stages {
    stage('Load trusted pipeline') {
      steps {
        checkout scm
        sh '''
          set -eu
          test -f deploy/helm/product-service/Chart.yaml
          test -f deploy/jenkins/scripts/release-callback.sh
          sed -i 's/\r$//' deploy/jenkins/scripts/release-callback.sh
        '''
      }
    }

    stage('Validate registered release') {
      steps {
        sh '''
          set -eu
          case "${RELEASE_KIND}" in DEPLOY|ROLLBACK) ;; *) exit 2 ;; esac
          case "${ENVIRONMENT}" in dev|prod) ;; *) exit 2 ;; esac
          test "${NAMESPACE}" = "app-${APP_ID}-${ENVIRONMENT}"
          test "${HELM_RELEASE}" = "app-${APP_ID}-${SERVICE_KEY}"
          printf '%s' "${IMAGE_REPOSITORY}" |
            grep -Eq "/apps/app-${APP_ID}/${SERVICE_KEY}$"
          printf '%s' "${SERVICE_KEY}" | grep -Eq '^[a-z][a-z0-9-]{1,31}$'
          printf '%s' "${RELEASE_ID}:${DEPLOYMENT_ID}:${APP_ID}:${CONTAINER_PORT}:${REPLICAS}" |
            grep -Eq '^[0-9]+:[0-9]+:[0-9]+:[0-9]+:[0-9]+$'
          test "${REPLICAS}" -ge 2
          test "${REPLICAS}" -le 100
          case "${IMAGE_TAG:-}" in latest|stable|main|master) exit 2 ;; esac
          if [ "${RELEASE_KIND}" = ROLLBACK ]; then
            printf '%s' "${IMAGE_DIGEST}" | grep -Eq '^sha256:[a-f0-9]{64}$'
            printf '%s' "${IMAGE_TAG}" | grep -Eq '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'
          fi
        '''
      }
    }

    stage('Checkout product') {
      when {
        expression { params.RELEASE_KIND == 'DEPLOY' }
      }
      steps {
        script {
          beginReleaseStep('CHECKOUT')
        }
        dir('product-source') {
          deleteDir()
          checkout([
            $class: 'GitSCM',
            branches: [[name: params.GIT_REF]],
            userRemoteConfigs: [[url: params.REPOSITORY_URL]],
            extensions: [
              [$class: 'CloneOption', shallow: true, depth: 20, noTags: false, timeout: 10],
              [$class: 'CleanBeforeCheckout']
            ]
          ])
          sh '''
            set -eu
            git rev-parse HEAD > ../.release-git-commit
            grep -Eq '^[a-f0-9]{40}$' ../.release-git-commit
            test -f Dockerfile
          '''
        }
        script {
          sendReleaseCallback('CHECKOUT', 'SUCCEEDED')
        }
      }
    }

    stage('Test product') {
      when {
        expression { params.RELEASE_KIND == 'DEPLOY' }
      }
      steps {
        script {
          beginReleaseStep('TEST')
        }
        dir('product-source') {
          sh '''
            set -eu
            test -f ./ci/test.sh
            sh ./ci/test.sh
          '''
        }
        script {
          sendReleaseCallback('TEST', 'SUCCEEDED')
        }
      }
    }

    stage('Build and push immutable image') {
      when {
        expression { params.RELEASE_KIND == 'DEPLOY' }
      }
      steps {
        script {
          beginReleaseStep('BUILD')
        }
        sh '''
          set -eu
          git_commit="$(cat .release-git-commit)"
          printf 'r%s-%.12s\n' "${RELEASE_ID}" "${git_commit}" > .release-image-tag
          grep -Eq '^r[0-9]+-[a-f0-9]{12}$' .release-image-tag
        '''
        withCredentials([usernamePassword(
          credentialsId: env.REGISTRY_CREDENTIAL_ID,
          usernameVariable: 'REGISTRY_USERNAME',
          passwordVariable: 'REGISTRY_PASSWORD'
        )]) {
          retry(3) {
            container('buildkit') {
              sh '''
                set +x
                set -eu
                umask 077
                RELEASE_GIT_COMMIT="$(cat .release-git-commit)"
                RELEASE_IMAGE_TAG="$(cat .release-image-tag)"
                export RELEASE_GIT_COMMIT RELEASE_IMAGE_TAG
                auth="$(printf '%s:%s' "${REGISTRY_USERNAME}" "${REGISTRY_PASSWORD}" | base64 | tr -d '\n')"
                printf '{"auths":{"%s":{"auth":"%s"}}}\n' \
                  "$(printf '%s' "${IMAGE_REPOSITORY}" | cut -d/ -f1)" "${auth}" \
                  > "${DOCKER_CONFIG}/config.json"
                unset auth REGISTRY_USERNAME REGISTRY_PASSWORD
                trap 'rm -f "${DOCKER_CONFIG}/config.json"' EXIT

                buildctl-daemonless.sh build \
                  --frontend dockerfile.v0 \
                  --local context="${WORKSPACE}/product-source" \
                  --local dockerfile="${WORKSPACE}/product-source" \
                  --opt filename=Dockerfile \
                  --opt "build-arg:APP_VERSION=${VERSION}" \
                  --opt "build-arg:VCS_REF=${RELEASE_GIT_COMMIT}" \
                  --opt "build-arg:IMAGE_TAG=${RELEASE_IMAGE_TAG}" \
                  --opt "build-arg:HTTP_PROXY=${HTTP_PROXY:-}" \
                  --opt "build-arg:HTTPS_PROXY=${HTTPS_PROXY:-}" \
                  --opt "build-arg:NO_PROXY=${NO_PROXY:-}" \
                  --metadata-file .product-image.json \
                  --output "type=image,name=${IMAGE_REPOSITORY}:${RELEASE_IMAGE_TAG},push=true"

                sed -n 's/.*"containerimage.digest"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/p' \
                  .product-image.json > .product-image-digest
                grep -Eq '^sha256:[a-f0-9]{64}$' .product-image-digest
              '''
            }
          }
        }
        script {
          sendReleaseCallback('BUILD', 'SUCCEEDED')
          beginReleaseStep('PUSH')
          sendReleaseCallback('PUSH', 'SUCCEEDED')
        }
      }
    }

    stage('Prepare rollback image') {
      when {
        expression { params.RELEASE_KIND == 'ROLLBACK' }
      }
      steps {
        writeFile(file: '.release-git-commit', text: "${params.GIT_COMMIT_SHA}\n")
        writeFile(file: '.release-image-tag', text: "${params.IMAGE_TAG}\n")
        writeFile(file: '.product-image-digest', text: "${params.IMAGE_DIGEST}\n")
      }
    }

    stage('Forward-compatible migration gate') {
      when {
        expression { params.RELEASE_KIND == 'DEPLOY' }
      }
      steps {
        script {
          beginReleaseStep('MIGRATE')
          sh '''
            set -eu
            if [ -f product-source/ci/migrate-expand.sh ]; then
              sh product-source/ci/migrate-expand.sh
            fi
          '''
          sendReleaseCallback('MIGRATE', 'SUCCEEDED')
        }
      }
    }

    stage('Helm atomic rolling release') {
      steps {
        script {
          beginReleaseStep('HELM_UPGRADE')
        }
        container('helm') {
          sh '''
            set -eu
            RELEASE_IMAGE_TAG="$(cat .release-image-tag)"
            RELEASE_IMAGE_DIGEST="$(cat .product-image-digest)"
            export RELEASE_IMAGE_TAG RELEASE_IMAGE_DIGEST
            previous_revision=0
            if helm status "${HELM_RELEASE}" --namespace "${NAMESPACE}" >/dev/null 2>&1; then
              previous_revision="$(helm history "${HELM_RELEASE}" --namespace "${NAMESPACE}" \
                --max 1 | awk 'NR == 2 {print $1}')"
              test -n "${previous_revision}"
            fi
            printf '%s\n' "${previous_revision}" > .previous-helm-revision

            helm upgrade --install "${HELM_RELEASE}" deploy/helm/product-service \
              --namespace "${NAMESPACE}" \
              --set-string "serviceKey=${SERVICE_KEY}" \
              --set "replicaCount=${REPLICAS}" \
              --set-string "image.repository=${IMAGE_REPOSITORY}" \
              --set-string "image.tag=${RELEASE_IMAGE_TAG}" \
              --set-string "image.digest=${RELEASE_IMAGE_DIGEST}" \
              --set "containerPort=${CONTAINER_PORT}" \
              --set-string "resources.requests.cpu=${CPU_REQUEST}" \
              --set-string "resources.requests.memory=${MEMORY_REQUEST}" \
              --set-string "resources.limits.cpu=${CPU_LIMIT}" \
              --set-string "resources.limits.memory=${MEMORY_LIMIT}" \
              --set-string "probes.startup.path=${STARTUP_PATH}" \
              --set-string "probes.readiness.path=${READINESS_PATH}" \
              --set-string "probes.liveness.path=${LIVENESS_PATH}" \
              --atomic --wait --timeout 8m

            helm history "${HELM_RELEASE}" --namespace "${NAMESPACE}" --max 1 |
              awk 'NR == 2 {print $1}' > .helm-revision
            grep -Eq '^[1-9][0-9]*$' .helm-revision
          '''
        }
        script {
          sendReleaseCallback('HELM_UPGRADE', 'SUCCEEDED')
        }
      }
    }

    stage('Wait for rollout') {
      steps {
        script {
          beginReleaseStep('ROLLOUT')
        }
        container('kubectl') {
          sh '''
            set -eu
            kubectl -n "${NAMESPACE}" rollout status \
              "deployment/${HELM_RELEASE}" --timeout=5m
          '''
        }
        script {
          sendReleaseCallback('ROLLOUT', 'SUCCEEDED')
        }
      }
    }

    stage('HTTP smoke test') {
      steps {
        script {
          beginReleaseStep('SMOKE')
        }
        container('kubectl') {
          sh '''
            set -eu
            smoke_url="http://${HELM_RELEASE}.${NAMESPACE}.svc.cluster.local${SMOKE_PATH}"
            attempts=0
            until wget -q -T 5 -O /dev/null "${smoke_url}"; do
              attempts=$((attempts + 1))
              test "${attempts}" -lt 12
              sleep 5
            done
          '''
        }
        script {
          sendReleaseCallback('SMOKE', 'SUCCEEDED')
        }
      }
    }
  }

  post {
    failure {
      script {
        try {
          def fallbackStep = params.RELEASE_KIND == 'ROLLBACK' ? 'PREPARE' : 'CHECKOUT'
          def failedStep = fileExists('.current-release-step') ?
            readFile('.current-release-step').trim() : fallbackStep
          sendReleaseCallback(failedStep, 'FAILED')
        } catch (ignored) {
          echo 'Failed step callback was not acknowledged'
        }
        try {
          beginReleaseStep('ROLLBACK')
          container('helm') {
            sh '''
              set -eu
              previous_revision="$(cat .previous-helm-revision 2>/dev/null || printf 0)"
              if [ "${previous_revision}" -gt 0 ]; then
                helm rollback "${HELM_RELEASE}" "${previous_revision}" \
                  --namespace "${NAMESPACE}" --wait --timeout 5m
              else
                helm status "${HELM_RELEASE}" --namespace "${NAMESPACE}" >/dev/null
              fi
            '''
          }
          sendReleaseCallback('ROLLBACK', 'SUCCEEDED')
        } catch (rollbackFailure) {
          try {
            sendReleaseCallback('ROLLBACK', 'FAILED')
          } catch (ignored) {
            echo 'Rollback callback was not acknowledged'
          }
          throw rollbackFailure
        }
      }
    }
  }
}

