# NPM Publishing with Token (Alternative Method)

Since the interactive login requires browser completion, you can use an NPM token instead:

## 🔑 Create NPM Token

1. **Go to NPM**: https://www.npmjs.com/
2. **Login**: Click "Log In" 
3. **Create Token**: Go to "Access Tokens" → "Generate New Token"
4. **Configure Token**:
   - Name: `openwork-agent-publish`
   - Expiration: Choose expiration date
   - Scopes: Leave blank (no scopes needed)
   - Permissions: Check "Automate" and "Publish" boxes
5. **Copy Token**: Click "Copy to clipboard"
6. **Note**: Save the token securely

## 🚀 Publish Using Token

```bash
# Set your token as environment variable
export NPM_TOKEN="your_copied_token_here"

# Or add to your ~/.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Then publish
npm publish
```

## 📋 Step-by-Step Commands

```bash
# 1. Set token (replace with your actual token)
export NPM_TOKEN="npm_xxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 2. Publish
npm publish

# 3. Verify
npm view openwork-agent
```

## ✅ Benefits of Token Method
- **No browser required** (pure terminal)
- **Re-usable** for CI/CD pipelines
- **More secure** than classic username/password
- **Revocable** at any time
- **Standard practice** for automated deployments

## 🔐 Security Note
- **Never commit** the token to Git
- **Don't share** the token publicly  
- **Store securely** (e.g., environment variable)
- **Revoke** compromised tokens immediately

---

**Choose either the browser login or token method to publish your package!**