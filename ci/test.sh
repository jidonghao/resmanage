#!/bin/sh
set -eu

test -f Dockerfile
test -f go.mod
test -f main.go
test -f main_test.go
grep -q '/health/startup' main.go
grep -q '/health/ready' main.go
grep -q '/health/live' main.go
grep -q '/business/ping' main.go
grep -q 'signal.Notify' main.go
grep -q 'AS test' Dockerfile
grep -q 'AS runtime' Dockerfile
grep -q 'go test ./...' Dockerfile
grep -Eq 'golang:1\.26\.5-alpine3\.23@sha256:[a-f0-9]{64}' Dockerfile
grep -q 'org.opencontainers.image.revision' Dockerfile
printf 'M6 release fixture contract: PASS\n'
