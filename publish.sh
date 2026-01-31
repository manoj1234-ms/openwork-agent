#!/bin/bash

echo "🚀 Publishing openwork-agent..."
echo "📋 Please enter your NPM access token:"
read -s NPM_TOKEN

if [ -z "$NPM_TOKEN" ]; then
    echo "❌ Error: No token provided"
    echo "📝 Please generate a token at: https://www.npmjs.com/"
    echo "💡 Check TOKEN_GUIDE.md for detailed instructions"
    exit 1
fi

echo "🔐 Setting token..."
npm config set //registry.npmjs.org/:_authToken="$NPM_TOKEN"

echo "📦 Publishing package..."
npm publish

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS! openwork-agent published successfully!"
    echo ""
    echo "🌍 Check it out: https://npmjs.com/package/openwork-agent"
    echo "🎉 Users can install: npm install -g openwork-agent"
else
    echo "❌ Publish failed. Check the error above."
    exit 1
fi