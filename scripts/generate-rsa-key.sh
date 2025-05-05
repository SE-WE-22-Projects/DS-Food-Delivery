#!/bin/bash
set -e

root_dir=$(dirname $(dirname $(realpath $0)))

openssl genrsa -out service.priv.key 2048
openssl rsa -in service.priv.key -pubout >service.pub.key
