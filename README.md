# Bajaj Full Stack Round 1

Required endpoint:

```txt
POST /api/graph
Content-Type: application/json
```

Request:

```json
{
  "edges": ["A->B", "A->C", "B->D"]
}
```

Local run:

```bash
npm install
npm test
npm run dev
```

Open:

```txt
http://localhost:3000
```

For Vercel deployment, add these environment variables before deploying:

```txt
USER_ID=firstname_yyyymmdd
EMAIL_ID=your university email
ENROLLMENT_NUMBER=your roll/enrollment number
```
