# Development Guide

## Publishing to npm

To publish a new version of this package to npm, follow these steps:

### 1. Get npm Token

1. **Login to npm**:
   - Go to [npmjs.com](https://www.npmjs.com/) and login to your account.

2. **Generate an Access Token**:
   - Click on your profile picture in the top right corner and select "Access Tokens".
   - Click on "Generate New Token" and select "Publish".
   - Enter a name for your token (e.g., "GitHub Actions").
   - Click on "Generate Token" and copy the generated token.

### 2. Set up GitHub Secrets

1. **Go to your GitHub repository**:
   - Navigate to `https://github.com/Ulyssesyi/screen-dimensions/settings/secrets/actions`.

2. **Add NPM_TOKEN**:
   - Click on "New repository secret".
   - Enter `NPM_TOKEN` as the name.
   - Paste the npm token you copied earlier into the value field.
   - Click on "Add secret".

### 3. Publish a New Version

1. **Update version in package.json**:
   - Edit the `version` field in `package.json` to the new version number (e.g., from `1.0.0` to `1.0.1`).

2. **Commit changes**:
   ```bash
   git add package.json
   git commit -m "Bump version to v1.0.1"
   git push
   ```

3. **Create and push tag**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **GitHub Actions will automatically**:
   - Run tests
   - Build the project
   - Create a GitHub Release
   - Publish to npm

## Local Development

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test
```

### Build the project
```bash
npm run build
```

### Format code
```bash
npm run format
```
