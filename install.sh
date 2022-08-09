#!/bin/bash

MIN_NODE_VERSION=12
DOWNLOAD_DIR="/tmp/mod-manager-install"
INSTALL_DIR="/usr/local/lib/mod-manager"
CYAN="\033[1;96m"
RED="\033[0;91m"
GREEN="\033[0;92m"
RESET='\033[0m'

print () {
  echo -e "$1 $2 $RESET"
}

info () {
  print "$CYAN" "$1"
}

error() {
  print "$RED" "$1"
}

success() {
  print "$GREEN" "$1"
}

rm -rf "$DOWNLOAD_DIR"
mkdir -p "$DOWNLOAD_DIR"

# Verify compatible version of node is installed
info "Verifying node verison..."
NODE_VERSION=$( (node --version | sed 's/\..*//') | sed "s/v//")
if [[ "$NODE_VERSION" -ge "$MIN_NODE_VERSION" ]]
then
  success "A version of node greater than $MIN_NODE_VERSION is installed!"
else
  error "A version of node greater than $MIN_NODE_VERSION is required. Please install it and re run this install script"
  exit
fi

# Download source files
info "Downloading mod-manager source..."
git clone "https://hogwarts.bits.team/git/Bits/mod-manager.git" "$DOWNLOAD_DIR" || exit

# Compile
info "Compiling..."
cd "$DOWNLOAD_DIR" || exit
npm install --save
npm install -g @vercel/ncc
npx tsc;
ncc build build/ts/mod-manager.js -o build/flat

# Install
info "Installing..."
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

cp -r build/flat/* "$INSTALL_DIR"

# Creating executable
info "Creating executable..."
echo "node $INSTALL_DIR/index.js \$\@" > /usr/bin/mod-manager

# Cleaning up
info "Cleaning up..."
rm -rf "$DOWNLOAD_DIR"

success "Successfully installed mod-manager. Try mod-manager -h to learn more!"
