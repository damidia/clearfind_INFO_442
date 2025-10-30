# ClearFind — SEO & AEO Optimization Analyzer

*A project by Akhil Damidi for INFO 442: Cooperative Software Development (University of Washington)*

<img width="961" height="516" alt="image" src="https://github.com/user-attachments/assets/03a709ea-77d2-4257-9671-36b0ca566f54" />


---

## Overview

**ClearFind** is a web application that helps users analyze how well a website is optimized for:

* **SEO (Search Engine Optimization)** — how search engines understand your site
* **AEO (Answer Engine Optimization)** — how AI systems and assistants interpret your content

Users can paste a URL and receive structured feedback, recommendations, and educational insights about how to improve discoverability and clarity on the web.

This tool was built as part of an individual prototype project for **INFO 442: Cooperative Software Development** at the University of Washington.

---

## Features

* **Instant SEO & AEO Analysis** — Input any URL and get categorized results with clear fixes
* **Tabbed Results View** — Toggle between SEO and AEO findings
* **“Learn” Section** — Beginner-friendly explanations of key concepts like metadata, JSON-LD, and accessibility
* **Export JSON** — Save analysis results locally
* **Educational Design** — Clean, modern interface inspired by Lighthouse & PageSpeed Insights

---

## Tech Stack

**Frontend:**

* React (Vite)
* Axios
* HTML + CSS (custom blue–purple gradient design)

**Backend:**

* Node.js + Express
* Cheerio (for HTML parsing)
* Axios (for fetching web pages)
* CORS + Dotenv
* MongoDB (optional stub for persistence)

**Deployment:**

* Frontend hosted on [Vercel](https://vercel.com)
* Backend hosted on [Render](https://render.com)

---

## Getting Started (Run Locally)

### Clone the repository

```bash
git clone https://github.com/damidia/clearfind_INFO_442.git
cd clearfind_INFO_442
```

### Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

## Environment Setup

Create a `.env` file in the root directory with the following:

```bash
MONGO_URI=<your MongoDB connection string>
PORT=5000
```

---

## Start Backend

```bash
cd backend
npm run dev
```

This starts the server at **[http://localhost:5000](http://localhost:5000)**

---

## Start Frontend

```bash
cd ../frontend
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**

---

## API Routes

| Route                     | Method | Description                                                  |
| ------------------------- | ------ | ------------------------------------------------------------ |
| `/api/scan`               | POST   | Fetches and parses a website, returning SEO and AEO findings |
| `/api/history` *(future)* | GET    | Retrieve previously saved scans (optional MongoDB use)       |

### Example Response

```json
{
  "url": "https://example.com",
  "summary": { "issues": 2, "oks": 4, "infos": 3 },
  "seo": { "findings": [...] },
  "aeo": { "findings": [...] }
}
```

---

## Screenshots

**Home / Analysis Input**

<img width="961" height="516" alt="image" src="https://github.com/user-attachments/assets/37bfaa71-fbc4-4c5c-aca9-5f8c435f8088" />

**Results Section**

<img width="434" height="162" alt="image" src="https://github.com/user-attachments/assets/ff79022a-549a-4212-a7b3-f26018de05c2" />


**Learn Section**

<img width="434" height="413" alt="image" src="https://github.com/user-attachments/assets/513d56f5-9fbc-4586-958f-e419f5ac7c43" />


---

## Feedback & Iteration

**ClearFind** was tested with both technical and non-technical users:

* **Zoe (INFO 442 classmate):** Suggested lighter gradients, clearer icons, and examples in the Learn section.
* **Kristina (Chemistry major):** Emphasized clarity for beginners and the importance of labeling input expectations.

Their feedback led to UI refinements and improved user clarity.

---

## Known Issues

The deployed version currently experiences CORS and environment variable issues between **Render (backend)** and **Vercel (frontend)**.

All functionality works perfectly in local development.

If running locally, ensure:

* Both servers are active
* CORS is enabled in `server.js`
* `.env` file contains a valid MongoDB URI

---

## Future Plans

* Fix Render–Vercel deployment integration
* Add priority scoring for SEO/AEO issues
* Expand Learn section into interactive lessons
* Include AI-based recommendations for optimizing content

---

## Author

**Akhil Damidi**
University of Washington — Information School
📧 [adamidi@uw.edu](mailto:adamidi@uw.edu)

[LinkedIn](https://www.linkedin.com/in/akhil-r-damidi/) | [GitHub](https://github.com/damidia)

---

## License

This project is open-source and available under the **MIT License**.

---

## Acknowledgments

* Google SEO Starter Guide
* Schema.org
* Cheerio Documentation
* Vite + React Docs

> “ClearFind helps users — and future developers — understand how structure and meaning power discoverability on the modern web.”
