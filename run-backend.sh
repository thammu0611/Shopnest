#!/usr/bin/env bash
# Starts the Spring Boot API on http://localhost:8080
cd "$(dirname "$0")/backend" && mvn spring-boot:run
