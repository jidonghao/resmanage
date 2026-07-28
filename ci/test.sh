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
grep -q 'go test ./...' Dockerfile
printf 'M6 release fixture contract: PASS\n'
