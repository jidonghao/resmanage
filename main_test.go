package main

import (
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
