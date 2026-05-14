# Contributing To Rezumix

Before making changes, read [README.md](./README.md).

## Before You Start

1. Check whether an issue already exists for the change you want to make.
2. If there is no issue, open one and clearly describe the problem or enhancement.
3. Keep your PR focused on one main objective.
4. Do not commit `.env.local`, secrets, generated sitemap files, or local-only artifacts.
5. If your change affects UI, attach screenshots in the PR.
6. If your change affects auth, uploads, AI flows, or email, mention the required external services in the PR description.

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended
- MongoDB Atlas or another reachable MongoDB deployment
- Gemini API key
- Cloudinary account for upload-related features
- SMTP credentials for OTP and contact-email testing

### Install

```bash
git clone https://github.com/thedevanshagrawal/rezumix.git
cd rezumix
npm install
```

> <b>NOTE:- `IF YOU ARE CONTRIBUTING THROUGH GITHUB, FORK THE REPOSITORY FIRST AND CLONE YOUR REPO.`</b>

### Environment Variables

Create `.env.local` inside the `rezumix/` folder.

```env
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
JWT_SECRET=
GEMINI_API_KEY=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXTAUTH_URL=http://localhost:3000
```

Use the same variable meanings described in [README.md](./README.md). The important setup detail is that `.env.local` must be inside the repository root, not in the parent workspace.

### Start The App

```bash
npm run dev
```

Open `http://localhost:3000`.

### Common Local Blocker

If login or registration fails with a MongoDB Atlas connection error, your current IP probably is not whitelisted yet. Add your current IP in MongoDB Atlas `Network Access` and try again.

## Default PR Procedure For Beginners

1. Pick an existing issue or open a new issue describing the problem.
2. Comment on the issue if the repository uses issue assignment or first-come coordination.
3. Fork the repository to your GitHub account.
4. Clone your fork locally.
5. Create a dedicated branch for your work.

```bash
git checkout -b docs/readme-improvements
```

6. Make only the changes needed for that issue.
7. Run a focused verification step. For this project, `npm run build` is the most reliable repository-wide check right now.
8. Manually test the pages or flows you changed.
9. Commit with a clear message.

```bash
git add .
git commit -m "docs: improve README and contribution guide"
```

10. Push your branch to your fork.

```bash
git push origin docs/readme-improvements
```

11. Open a pull request against the main project repository.
12. Link the issue in the PR description.
13. Add a short summary of what changed, how you tested it, and screenshots if relevant.
14. Respond to review comments and update the branch if maintainers request changes.

## Verification Checklist

Use the checks that fit your change:

- `npm run build`
- Manual testing of the exact page or API flow you touched
- Screenshots for UI changes
- Clear note about any required env variables or external services

Current repo note: the existing `npm run lint` script still points to `next lint` and is not the most reliable project-wide check for the current Next.js version. Use `npm run build` and manual validation for now.

## PR Checklist

- Link the related issue
- Keep the PR focused and easy to review
- Explain the problem and the solution
- Mention how you tested the change
- Include screenshots for UI updates
- Do not include secrets or `.env.local`
- Do not include unrelated refactors

