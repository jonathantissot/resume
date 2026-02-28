# Jonathan Tissot - CV Website (React)

A modern, data-driven CV website built with React, Tailwind CSS, and deployed to Kubernetes via GitHub Actions.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with components and data files
- **Data-Driven Content**: All content stored in JSON files for easy updates without touching code
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Google Analytics 4**: Built-in GA4 analytics integration
- **Docker & Kubernetes Ready**: Containerized application with Kubernetes deployment manifests
- **GitHub Actions CI/CD**: Automated building, testing, and pushing to container registry
- **Fast & Performant**: Built with Vite for optimal development and production performance

## 📁 Project Structure

```
webpagev2/
├── src/
│   ├── components/        # React components (10 total)
│   ├── data/             # JSON data files (8 total)
│   ├── services/         # Analytics service
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── k8s/
│   └── deployment.yaml
├── .github/workflows/
│   └── build-docker.yml
├── Dockerfile
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── index.html
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix code issues

## 📝 Content Management

All content is managed through JSON files in `src/data/`:

- `profile.json` - Personal info, title, social links
- `skills.json` - Technical and soft skills
- `education.json` - Academic education
- `certifications.json` - Certifications (25 entries)
- `experiences.json` - Job history (13 positions)
- `achievements.json` - Career achievements (13 items)
- `recommendations.json` - Professional recommendations (6)
- `socialLinks.json` - Social media profiles

### Adding Content Examples

**Add a Job Experience:**
Edit `src/data/experiences.json` and add to the `experiences` array.

**Add a Certification:**
Edit `src/data/certifications.json` and add to the `certifications` array.

**Update Skills:**
Edit `src/data/skills.json` - update `softSkills` or `technicalSkills`.

## 🎨 Styling

Built with **Tailwind CSS** for modern, responsive design.

- Mobile-first approach
- Blue-based color theme
- Responsive utilities with `md:` and `lg:` prefixes
- Custom CSS in `src/index.css`

## 🐳 Docker & Kubernetes

### Build Docker Image

```bash
docker build -t jonathan-cv:latest .
docker run -p 3000:80 jonathan-cv:latest
```

### Deploy to Kubernetes

```bash
# Update image URL in k8s/deployment.yaml
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -l app=jonathan-cv
kubectl get svc jonathan-cv
```

### View Logs

```bash
kubectl logs -l app=jonathan-cv -f
```

## 🔄 GitHub Actions CI/CD

The workflow automatically:
1. Builds React application
2. Runs ESLint
3. Builds Docker image
4. Pushes to GitHub Container Registry (GHCR)

Triggers on push to `main` or `develop` branches.

## 📈 Performance

- **Vite**: Ultra-fast builds
- **Tailwind CSS**: Purged unused styles in production
- **Multi-stage Docker**: Optimized image size
- **Kubernetes HPA**: Auto-scales based on CPU/Memory

## 🔒 Security

- Resource limits configured in Kubernetes
- Health checks enabled
- Non-root user in Docker
- Latest dependencies

## 📚 Further Reading

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Kubernetes Docs](https://kubernetes.io/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)

## 🚀 Deployment

```bash
npm run build
aws s3 sync dist/ s3://kopius-jt --delete
aws cloudfront create-invalidation --distribution-id E1631T979B1SEX --paths "/*"
```