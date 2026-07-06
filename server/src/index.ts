import express from "express";
import { applications } from "./data/applications.js";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  Priority,
  UpdateApplicationInput,
  ValidationStatus,
} from "./types.js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

const applicationStatuses: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

const priorities: Priority[] = ["Low", "Medium", "High"];
const validationStatuses: ValidationStatus[] = ["valid", "warning", "error"];

const createApplicationId = () => `app_${Date.now()}`;

const isApplicationStatus = (value: string): value is ApplicationStatus =>
  applicationStatuses.includes(value as ApplicationStatus);

const isPriority = (value: string): value is Priority =>
  priorities.includes(value as Priority);

const isValidationStatus = (value: string): value is ValidationStatus =>
  validationStatuses.includes(value as ValidationStatus);

const hasRequiredApplicationFields = (
  application: Partial<CreateApplicationInput>
): application is CreateApplicationInput =>
  typeof application.role === "string" &&
  typeof application.company === "string" &&
  typeof application.salary === "number" &&
  typeof application.status === "string" &&
  typeof application.source === "string" &&
  typeof application.priority === "string" &&
  typeof application.jobUrl === "string" &&
  typeof application.validationStatus === "string";

const decodeHtmlEntities = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();

const extractTagContent = (html: string, tagName: string) => {
  const match = html.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i")
  );

  return match ? decodeHtmlEntities(match[1].replace(/<[^>]*>/g, "")) : "";
};

const extractMetaContent = (html: string, name: string) => {
  const match = html.match(
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    )
  );

  return match ? decodeHtmlEntities(match[1]) : "";
};

const stripHtml = (html: string) =>
  decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

const toCompanyName = (url: URL) => {
  const domainParts = url.hostname.replace(/^www\./, "").split(".");
  const name = domainParts[0] ?? "Unknown company";

  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

const toSourceName = (url: URL) => {
  const hostname = url.hostname.replace(/^www\./, "");
  const platformNames: Record<string, string> = {
    "greenhouse.io": "Greenhouse",
    "lever.co": "Lever",
    "linkedin.com": "LinkedIn",
    "indeed.com": "Indeed",
    "workdayjobs.com": "Workday",
    "ashbyhq.com": "Ashby",
  };

  const platform = Object.entries(platformNames).find(([domain]) =>
    hostname.includes(domain)
  );

  return platform?.[1] ?? hostname;
};

const isJobBoardSource = (source: string) =>
  ["LinkedIn", "Indeed", "Greenhouse", "Lever", "Workday", "Ashby"].includes(
    source
  );

const cleanTitlePart = (value: string) =>
  value
    .replace(/\b(careers?|jobs?|job opening|open roles?|apply now)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const parseRoleAndCompany = (title: string, fallbackCompany: string) => {
  const normalizedTitle = cleanTitlePart(title);
  const linkedinHiringMatch = normalizedTitle.match(
    /^(.+?)\s+hiring\s+(.+?)(?:\s+in\s+.+)?(?:\s[|–—-]\s+LinkedIn)?$/i
  );

  if (linkedinHiringMatch) {
    return {
      role: cleanTitlePart(linkedinHiringMatch[2]),
      company: cleanTitlePart(linkedinHiringMatch[1]),
    };
  }

  const atCompanyMatch = normalizedTitle.match(/^(.+?)\s+at\s+(.+?)(?:\s[|–—-]\s+.+)?$/i);

  if (atCompanyMatch) {
    return {
      role: cleanTitlePart(atCompanyMatch[1]),
      company: cleanTitlePart(atCompanyMatch[2]),
    };
  }

  const separators = /\s(?:at|@)\s|\s[-|–—]\s|\s·\s|\s:\s/gi;
  const parts = normalizedTitle
    .split(separators)
    .map(cleanTitlePart)
    .filter(Boolean);

  if (parts.length >= 2) {
    const [first, second] = parts;
    const firstLooksLikeRole =
      /\b(engineer|developer|designer|manager|analyst|specialist|architect|lead|director|product|frontend|backend|full-stack|software|web|ui|ux)\b/i.test(
        first
      );
    const secondLooksLikeRole =
      /\b(engineer|developer|designer|manager|analyst|specialist|architect|lead|director|product|frontend|backend|full-stack|software|web|ui|ux)\b/i.test(
        second
      );

    if (firstLooksLikeRole && !secondLooksLikeRole) {
      return { role: first, company: second };
    }

    if (secondLooksLikeRole && !firstLooksLikeRole) {
      return { role: second, company: first };
    }

    return { role: first, company: second || fallbackCompany };
  }

  return {
    role: normalizedTitle || `New job from ${fallbackCompany}`,
    company: fallbackCompany,
  };
};

const extractSalary = (text: string) => {
  const salaryMatch = text.match(
    /\$?\s?(\d{2,3}(?:,\d{3})+|\d{3})\s?(?:k|K)?(?:\s?[-–—]\s?\$?\s?(\d{2,3}(?:,\d{3})+|\d{3})\s?(?:k|K)?)?/i
  );

  if (!salaryMatch) {
    return 0;
  }

  const toNumber = (value: string) => {
    const number = Number(value.replaceAll(",", ""));
    return number < 1000 ? number * 1000 : number;
  };

  const low = toNumber(salaryMatch[1]);
  const high = salaryMatch[2] ? toNumber(salaryMatch[2]) : low;

  return Math.round((low + high) / 2);
};

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.post("/api/job-url/extract", async (req, res) => {
  const { url } = req.body as { url?: string };

  if (!url) {
    res.status(400).json({ error: "Job URL is required." });
    return;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Please enter a valid URL." });
    return;
  }

  const source = toSourceName(parsedUrl);
  const fallbackCompany = isJobBoardSource(source)
    ? "Unknown company"
    : toCompanyName(parsedUrl);
  let company = fallbackCompany;
  let role = `New job from ${company}`;
  let salary = 0;
  let extractionStatus = "fallback";

  try {
    const response = await fetch(parsedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JobSearchStudio/0.1; +http://localhost)",
      },
    });

    if (response.ok) {
      const html = await response.text();
      const title =
        extractMetaContent(html, "og:title") ||
        extractMetaContent(html, "twitter:title") ||
        extractTagContent(html, "title");
      const siteName =
        extractMetaContent(html, "og:site_name") ||
        extractMetaContent(html, "application-name");

      if (title) {
        const parsedTitle = parseRoleAndCompany(title, fallbackCompany);
        role = parsedTitle.role;
        company =
          parsedTitle.company ||
          (siteName && !isJobBoardSource(source) ? siteName : "") ||
          fallbackCompany;
        salary = extractSalary(stripHtml(html));
        extractionStatus = "extracted";
      }
    }
  } catch {
    extractionStatus = "fallback";
  }

  const application: CreateApplicationInput = {
    role,
    company,
    salary,
    status: "Wishlist",
    appliedDate: null,
    followUpDate: null,
    contact: null,
    notes: null,
    source,
    priority: "Medium",
    jobUrl: parsedUrl.toString(),
    validationStatus: "warning",
  };

  res.json({
    application,
    extractionStatus,
  });
});

app.get("/api/applications", (req, res) => {
  const { status, priority, validationStatus, search } = req.query;
  let results = [...applications];

  if (typeof status === "string") {
    if (!isApplicationStatus(status)) {
      res.status(400).json({ error: "Invalid application status." });
      return;
    }

    results = results.filter((application) => application.status === status);
  }

  if (typeof priority === "string") {
    if (!isPriority(priority)) {
      res.status(400).json({ error: "Invalid priority." });
      return;
    }

    results = results.filter(
      (application) => application.priority === priority
    );
  }

  if (typeof validationStatus === "string") {
    if (!isValidationStatus(validationStatus)) {
      res.status(400).json({ error: "Invalid validation status." });
      return;
    }

    results = results.filter(
      (application) => application.validationStatus === validationStatus
    );
  }

  if (typeof search === "string") {
    const normalizedSearch = search.toLowerCase();

    results = results.filter(
      (application) =>
        application.role.toLowerCase().includes(normalizedSearch) ||
        application.company.toLowerCase().includes(normalizedSearch)
    );
  }

  res.json({
    applications: results,
  });
});

app.get("/api/applications/:id", (req, res) => {
  const application = applications.find(({ id }) => id === req.params.id);

  if (!application) {
    res.status(404).json({ error: "Application not found." });
    return;
  }

  res.json({ application });
});

app.post("/api/applications", (req, res) => {
  const input = req.body as Partial<CreateApplicationInput>;

  if (!hasRequiredApplicationFields(input)) {
    res.status(400).json({ error: "Missing required application fields." });
    return;
  }

  if (!isApplicationStatus(input.status)) {
    res.status(400).json({ error: "Invalid application status." });
    return;
  }

  if (!isPriority(input.priority)) {
    res.status(400).json({ error: "Invalid priority." });
    return;
  }

  if (!isValidationStatus(input.validationStatus)) {
    res.status(400).json({ error: "Invalid validation status." });
    return;
  }

  const application: Application = {
    id: input.id ?? createApplicationId(),
    role: input.role,
    company: input.company,
    salary: input.salary,
    status: input.status,
    appliedDate: input.appliedDate ?? null,
    followUpDate: input.followUpDate ?? null,
    contact: input.contact ?? null,
    notes: input.notes ?? null,
    source: input.source,
    priority: input.priority,
    jobUrl: input.jobUrl,
    validationStatus: input.validationStatus,
  };

  applications.push(application);

  res.status(201).json({ application });
});

app.patch("/api/applications/:id", (req, res) => {
  const applicationIndex = applications.findIndex(
    ({ id }) => id === req.params.id
  );

  if (applicationIndex === -1) {
    res.status(404).json({ error: "Application not found." });
    return;
  }

  const input = req.body as UpdateApplicationInput;

  if (input.status !== undefined && !isApplicationStatus(input.status)) {
    res.status(400).json({ error: "Invalid application status." });
    return;
  }

  if (input.priority !== undefined && !isPriority(input.priority)) {
    res.status(400).json({ error: "Invalid priority." });
    return;
  }

  if (
    input.validationStatus !== undefined &&
    !isValidationStatus(input.validationStatus)
  ) {
    res.status(400).json({ error: "Invalid validation status." });
    return;
  }

  const updatedApplication: Application = {
    ...applications[applicationIndex],
    ...input,
    id: applications[applicationIndex].id,
  };

  applications[applicationIndex] = updatedApplication;

  res.json({ application: updatedApplication });
});

app.delete("/api/applications/:id", (req, res) => {
  const applicationIndex = applications.findIndex(
    ({ id }) => id === req.params.id
  );

  if (applicationIndex === -1) {
    res.status(404).json({ error: "Application not found." });
    return;
  }

  applications.splice(applicationIndex, 1);

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server environment ready on port ${port}`);
});
