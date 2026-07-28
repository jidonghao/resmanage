{{- define "product-service.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "product-service.selectorLabels" -}}
app.kubernetes.io/name: {{ .Values.serviceKey }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "product-service.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: product-runtime
app.kubernetes.io/version: {{ .Values.image.tag | quote }}
{{ include "product-service.selectorLabels" . }}
{{- end -}}

{{- define "product-service.image" -}}
{{- printf "%s@%s" .Values.image.repository .Values.image.digest -}}
{{- end -}}
