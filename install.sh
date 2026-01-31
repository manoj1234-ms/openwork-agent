#!/bin/bash

# OpenWork Agent Installation Script

echo "🚀 Installing OpenWork Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to version $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create symlink for global usage (optional)
read -p "🌍 Install globally? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Creating global symlink..."
    npm link
    echo "✅ OpenWork Agent installed globally!"
    echo "You can now use 'openwork-agent' from anywhere."
else
    echo "✅ OpenWork Agent installed locally!"
    echo "Run with: node src/main.js or npm start"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📚 Quick start:"
echo "  openwork-agent create my-api"
echo "  openwork-agent --help"
echo ""
echo "📖 Documentation: https://github.com/your-repo/openwork-agent"