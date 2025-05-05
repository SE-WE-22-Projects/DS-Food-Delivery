#!/bin/bash
set -e

# Updates the dependencies in go services

root_dir=$(dirname $(dirname $(realpath $0)))
go_services=(delivery-service order-service restaurant-service upload-service user-service)
go_packages=(shared)

update_shared() {
    for service in ${go_services[*]}; do
        service_path="$root_dir/$service"
        echo "Updating shared package version in $service"
        cd $service_path
        go get github.com/SE-WE-22-Projects/DS-Food-Delivery/shared@dev
        go mod tidy
        echo "Done"
    done
}

update_dependencies() {
    for service in ${go_services[*]}; do
        service_path="$root_dir/$service"
        echo "Updating dependencies $service"
        cd $service_path
        go get -u "./..."

        # force the usage of the dev version
        go get github.com/SE-WE-22-Projects/DS-Food-Delivery/shared@dev

        go mod tidy
        echo "Done"
    done

    for service in ${go_packages[*]}; do
        service_path="$root_dir/$service"
        echo "Updating dependencies $service $service_path"
        go get -u "./..."
        go mod tidy
        echo "Done"
    done
}

if [ "$1" = "shared" ]; then
    update_shared
elif [ "$1" = "all" ]; then
    update_dependencies
else
    echo "Invalid argument."
    echo "Usage update-go-deps.sh [shared|all]"
fi
