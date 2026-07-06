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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
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
