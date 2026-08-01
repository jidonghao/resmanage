package main

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthAndBusinessResponseContract(t *testing.T) {
	for _, status := range []string{"ok", "pong"} {
		response := httptest.NewRecorder()
		request := httptest.NewRequest("GET", "/", nil)
		jsonHandler(status)(response, request)
		if response.Code != 200 || !strings.Contains(response.Body.String(), `"status":"`+status+`"`) {
			t.Fatalf("status=%s code=%d body=%s", status, response.Code, response.Body.String())
		}
		if response.Header().Get("Cache-Control") != "no-store" {
			t.Fatal("health response must not be cached")
		}
	}
}

func TestAccessLogExcludesQueryAndHeaders(t *testing.T) {
	buffer := &bytes.Buffer{}
	logger := log.New(buffer, "", 0)
	handler := accessLog(http.HandlerFunc(jsonHandler("pong")), logger)
	request := httptest.NewRequest("GET", "/business/ping?token=must-not-log", nil)
	request.Header.Set("Authorization", "Bearer must-not-log")
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	logged := buffer.String()
	for _, expected := range []string{"method=GET", "path=/business/ping", "status=200"} {
		if !strings.Contains(logged, expected) {
			t.Fatalf("access log missing %q: %s", expected, logged)
		}
	}
	if strings.Contains(logged, "must-not-log") || strings.Contains(logged, "Authorization") {
		t.Fatalf("access log leaked request data: %s", logged)
	}
}

func TestAccessLogSkipsHealthProbes(t *testing.T) {
	buffer := &bytes.Buffer{}
	logger := log.New(buffer, "", 0)
	handler := accessLog(http.HandlerFunc(jsonHandler("ok")), logger)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, httptest.NewRequest("GET", "/health/ready", nil))

	if buffer.Len() != 0 {
		t.Fatalf("health probe should not create access log noise: %s", buffer.String())
	}
}
