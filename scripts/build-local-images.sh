#!/bin/bash
set -e

services=(delivery-service admin-ui notification-service payment-service restaurant-service upload-service web-ui api-gateway k8s order-service rabbitmq review-service user-service)

for service in ${services[*]}; do
    echo "Building $service"
    minikube image build -t "$service:local" "./$service"
    echo "Done building $service"
done
