## FOR PROMPTING - MARKDOWN 

MAIN BRANCH (LOCAL)
```bash
repomix "D:\0 AMAAN MAIN\My NextJS\student-performance-predictor" -o prompting/student-performance-repomix.md --style markdown --ignore "node_modules,.next,dist,build,.git,.turbo,coverage"
```

ONLY FRONTEND
```bash
repomix "D:\0 AMAAN MAIN\My NextJS\student-performance-predictor" -o prompting/frontend-repomix.md --style markdown --ignore "node_modules,.next,dist,build,.git,.turbo,coverage"
```

ONLY BACKEND
```bash
repomix "D:\0 AMAAN MAIN\My NextJS\student-performance-predictor" -o prompting/backend-repomix.md --style markdown --ignore "node_modules,.next,dist,build,.git,coverage"
```

## BACKEND - SETUP
```bash
cd backend
pip install -r requirements.txt
```

## CREATE ADMIN ACCESS 
```bash
Admin login: admin / admin123 at route "/admin"
Faculty login: faculty1 / faculty123 or register at route "/auth/register"
```

## TO READ FOLDER TREE
```bash
tree /F
```

## VERCEL
### FRONTEND
git diff HEAD^ HEAD --quiet . || exit 1
### BACKEND
git diff HEAD^ HEAD --quiet . || exit 1