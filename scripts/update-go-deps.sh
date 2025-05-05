#!/bin/bash
set -e

# Updates the dependencies in go services

root_dir=$(dirname $(dirname $(realpath $0)))
go_services=(delivery-service order-service restaurant-service upload-service user-service)
go_packages=(shared)
all_deps=0

update_dependencies() {

    # Update dependencies of packages
    for service in ${go_packages[*]}; do
        service_path="$root_dir/$service"
        echo "Updating dependencies $service $service_path"
        cd $service_path

        go get -u "./..."
        go mod tidy
        echo "Done"
    done

    # Update dependencies of service
    for service in ${go_services[*]}; do
        service_path="$root_dir/$service"
        echo "Updating dependencies $service"
        cd $service_path

        if [ $all_deps -eq 1 ]; then
            go get -u "./..."
        fi

        # force the usage of the dev version
        go get github.com/SE-WE-22-Projects/DS-Food-Delivery/shared@dev

        go mod tidy
        echo "Done"
    done

}

if [ "$1" = "shared" ]; then
    all_deps=0
    update_shared
elif [ "$1" = "all" ]; then
    all_deps=1
    update_dependencies
else
    echo "Invalid argument."
    echo "Usage update-go-deps.sh [shared|all]"
fi
