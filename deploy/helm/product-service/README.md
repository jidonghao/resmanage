# product-service chart

This chart deploys one HTTP product service by immutable image digest. The Helm
release, namespace, image repository, service key, probes, replica count, and
resources are supplied only by the registered platform Deployment record.

It intentionally contains no database, Redis, Secret, ingress, arbitrary
command, or Pod exec surface. Product data services remain external.
