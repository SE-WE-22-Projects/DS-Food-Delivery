#!/bin/bash
set -e

services=(admin-ui delivery-service notification-service payment-service restaurant-service upload-service web-ui api-gateway k8s order-service rabbitmq review-service user-service)

for service in ${services[*]}; do
    minikube image build -t "$service:local" "./$service"
done
