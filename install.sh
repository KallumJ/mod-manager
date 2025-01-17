#!/bin/bash

MIN_NODE_VERSION=12
DOWNLOAD_DIR="/tmp/mod-manager-install"
INSTALL_DIR="/usr/local/lib/mod-manager"
BINARY_PATH="/usr/bin/mod-manager"
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

if [ "$EUID" -ne 0 ]
then
  error "This script must be ran as root. Please use sudo."
  exit
fi

rm -rf "$DOWNLOAD_DIR" || exit
mkdir -p "$DOWNLOAD_DIR" || exit

# Verify compatible version of node is installed
info "Verifying node verison..."
NODE_VERSION_STR=$(node --version)
if [[ "$?" -eq 127 ]]
then
  error "Node does not appear to be installed. Please install Node version $MIN_NODE_VERSION or higher"
  exit
fi

npm --version
if [[ "$?" -eq 127 ]]
then
  error "Npm does not appear to be installed. Please install npm and re run the installer"
  exit
fi


NODE_VERSION=$( (echo $NODE_VERSION_STR | sed 's/\..*//') | sed "s/v//")
if [[ "$NODE_VERSION" -ge "$MIN_NODE_VERSION" ]]
then
  success "A version of node greater than $MIN_NODE_VERSION is installed!"
else
  error "A version of node greater than $MIN_NODE_VERSION is required. Please install it and re run this install script"
  exit
fi

# Download source files
info "Downloading mod-manager source..."
git clone "https://git.bits.team/Bits/mod-manager.git" "$DOWNLOAD_DIR" || exit

# Compile
info "Compiling..."
cd "$DOWNLOAD_DIR" || exit
npm install --save || exit
npm install -g @vercel/ncc || exit
npx tsc || exit
ncc build build/ts/mod-manager.js -o build/flat/ || exit

# Install
info "Installing..."
rm -rf "$INSTALL_DIR" || exit
mkdir -p "$INSTALL_DIR" || exit

cp -r build/flat/* "$INSTALL_DIR" || exit

# Creating executable
info "Creating executable..."
echo "#!/bin/sh" > $BINARY_PATH || exit
echo "node $INSTALL_DIR/index.js \$@" >> $BINARY_PATH || exit
chmod +x $BINARY_PATH || exit

# Cleaning up
info "Cleaning up..."
rm -rf "$DOWNLOAD_DIR" || exit

success "Successfully installed mod-manager. Try mod-manager -h to learn more!"
