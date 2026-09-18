/**
 * Centralized Mock Data Store for Future-Ready Onboarding
 *
 * Provides typed, single-source-of-truth data models for:
 * - Employee profile & onboarding progress
 * - Interactive onboarding tasks
 * - Company policies & documentation
 * - Access & tool requests
 * - Team & mentor directory
 * - Conversational AI Q&A suggestions and responses
 */

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  startDate: string;
  avatarUrl: string;
  buddy: {
    id: string;
    name: string;
    role: string;
    email: string;
    slackHandle: string;
  };
  manager: {
    name: string;
    role: string;
    email: string;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: "IT Setup" | "HR & Compliance" | "Team & Culture" | "Engineering" | "Security";
  timeframe: "Day 1" | "Week 1" | "Month 1";
  isCompleted: boolean;
  estimatedMinutes: number;
  actionUrl?: string;
  actionLabel?: string;
}

export interface CompanyPolicy {
  id: string;
  title: string;
  category: "Workplace" | "Engineering" | "Security" | "HR & Benefits" | "Finance";
  summary: string;
  readTimeMinutes: number;
  lastUpdated: string;
  tags: string[];
  contentPreview: string;
}

export interface AccessRequestItem {
  id: string;
  type: "Software" | "Hardware" | "Cloud & Infrastructure" | "General";
  toolName: string;
  justification: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "Approved" | "In Review";
  submittedAt: string;
  approver: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  slackHandle: string;
  phone: string;
  timezone: string;
  isMentor: boolean;
  avatarInitials: string;
  directoryLabel?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

// ---------------------------------------------------------------------------
// Employee Profile
// ---------------------------------------------------------------------------
export const CURRENT_USER: EmployeeProfile = {
  id: "emp-2026-9481",
  name: "Alex Rivera",
  role: "Staff Full-Stack Engineer",
  department: "Core Infrastructure",
  email: "alex.rivera@enterprise.io",
  startDate: "Day 1 (Started Today)",
  avatarUrl: "",
  buddy: {
    id: "user-sarah",
    name: "Sarah Chen",
    role: "Staff Platform Architect",
    email: "sarah.chen@enterprise.io",
    slackHandle: "@sarah.chen",
  },
  manager: {
    name: "David Kim",
    role: "VP of Engineering",
    email: "david.kim@enterprise.io",
  },
};

// ---------------------------------------------------------------------------
// Onboarding Tasks
// ---------------------------------------------------------------------------
export const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-101",
    title: "Activate 1Password Vault & Configure Okta 2FA",
    description: "Verify security keys and enroll your company laptop in Jamf MDM.",
    category: "IT Setup",
    timeframe: "Day 1",
    isCompleted: true,
    estimatedMinutes: 20,
    actionUrl: "/knowledge",
    actionLabel: "View IT Guide",
  },
  {
    id: "task-102",
    title: "Complete Direct Deposit & Emergency Contacts",
    description: "Submit tax withholding and emergency information in the employee portal.",
    category: "HR & Compliance",
    timeframe: "Day 1",
    isCompleted: true,
    estimatedMinutes: 15,
  },
  {
    id: "task-103",
    title: "Clone Core Repositories & Verify Local Build",
    description: "Follow the Engineering Setup playbook to build frontend and backend services.",
    category: "Engineering",
    timeframe: "Day 1",
    isCompleted: false,
    estimatedMinutes: 45,
    actionUrl: "/knowledge",
    actionLabel: "Read Dev Setup",
  },
  {
    id: "task-104",
    title: "Introductory Coffee Chat with Assigned Buddy",
    description: "Schedule a 30-minute sync with Sarah Chen to discuss team rituals and tools.",
    category: "Team & Culture",
    timeframe: "Day 1",
    isCompleted: false,
    estimatedMinutes: 30,
  },
  {
    id: "task-105",
    title: "Submit AWS & Staging Cluster Access Requests",
    description: "Request sandbox developer role and GitHub team repository write access.",
    category: "IT Setup",
    timeframe: "Week 1",
    isCompleted: false,
    estimatedMinutes: 10,
    actionUrl: "/requests",
    actionLabel: "Go to Requests",
  },
  {
    id: "task-106",
    title: "Review Engineering Architecture & RFC Standards",
    description: "Read the architectural principles and pull request review guidelines.",
    category: "Engineering",
    timeframe: "Week 1",
    isCompleted: false,
    estimatedMinutes: 35,
    actionUrl: "/knowledge",
    actionLabel: "Read RFC Guide",
  },
  {
    id: "task-107",
    title: "Schedule Manager 30-Day Goal Alignment Session",
    description: "Meet with David Kim to align on first-month milestones and expectations.",
    category: "Team & Culture",
    timeframe: "Week 1",
    isCompleted: false,
    estimatedMinutes: 30,
  },
  {
    id: "task-108",
    title: "Review Security Policies & Sign Data Protection Agreement",
    description: "Read the SOC 2 compliance checklist and confirm device encryption policies.",
    category: "Security",
    timeframe: "Week 1",
    isCompleted: false,
    estimatedMinutes: 25,
    actionUrl: "/knowledge",
    actionLabel: "Read Security Doc",
  },
];

// ---------------------------------------------------------------------------
// Company Policies
// ---------------------------------------------------------------------------
export const POLICIES_DATA: CompanyPolicy[] = [
  {
    id: "pol-01",
    title: "Remote & Hybrid Work Guidelines",
    category: "Workplace",
    summary: "Standards on home office equipment allowances, asynchronous communication norms, and core overlap hours.",
    readTimeMinutes: 5,
    lastUpdated: "Sep 2026",
    tags: ["Remote", "Stipend", "Core Hours", "Workspace"],
    contentPreview: "Employees may work remotely or from any regional hub. Core collaboration hours are 10:00 AM to 3:00 PM in your local primary timezone. Full-time new hires are eligible for a $1,000 home office ergonomics stipend...",
  },
  {
    id: "pol-02",
    title: "Engineering RFC & Code Review Standards",
    category: "Engineering",
    summary: "Guidelines on branch naming conventions, PR templates, automated CI checks, and review SLAs.",
    readTimeMinutes: 8,
    lastUpdated: "Aug 2026",
    tags: ["GitHub", "Code Review", "CI/CD", "Architecture"],
    contentPreview: "All significant architectural changes require an RFC. PRs require at least two approvals from code owners. Pull requests must have automated test suites passing before merge...",
  },
  {
    id: "pol-03",
    title: "Information Security & Device Encryption",
    category: "Security",
    summary: "Mandatory security protocols covering 1Password, YubiKey 2FA, screen lock timeout, and public Wi-Fi VPN usage.",
    readTimeMinutes: 6,
    lastUpdated: "Sep 2026",
    tags: ["SOC2", "1Password", "VPN", "Encryption"],
    contentPreview: "Company laptops must have FileVault/BitLocker enabled with Jamf compliance. Passwords must never be stored in plain text. Always connect via Cloudflare Zero Trust WARP when working from public networks...",
  },
  {
    id: "pol-04",
    title: "Global Health, Wellness & Medical Benefits",
    category: "HR & Benefits",
    summary: "Comprehensive details on medical insurance, 401(k) matching up to 5%, annual wellness perks, and mental health counseling.",
    readTimeMinutes: 10,
    lastUpdated: "Jul 2026",
    tags: ["Medical", "Dental", "401k", "Wellness"],
    contentPreview: "Comprehensive health, dental, and vision coverage begins on your first day of employment. The company matches 100% of 401(k) contributions up to 5% of base salary. Employees receive an annual $1,200 wellness credit...",
  },
  {
    id: "pol-05",
    title: "Travel, Meals & Expense Reimbursement",
    category: "Finance",
    summary: "Standard procedures for submitting travel receipts, client dinners, conference tickets, and SaaS tool expenses via Ramp.",
    readTimeMinutes: 4,
    lastUpdated: "Aug 2026",
    tags: ["Expenses", "Ramp", "Travel", "Receipts"],
    contentPreview: "All corporate expenses must be submitted through Ramp within 30 days of purchase with itemized receipts. Meal allowances during business travel are capped at $75 per day...",
  },
  {
    id: "pol-06",
    title: "Paid Time Off (PTO) & Leave Policies",
    category: "HR & Benefits",
    summary: "Flexible discretionary PTO guidelines, company holidays, compassionate leave, and 16 weeks of paid parental leave.",
    readTimeMinutes: 5,
    lastUpdated: "Sep 2026",
    tags: ["PTO", "Holidays", "Parental Leave", "Vacation"],
    contentPreview: "We operate on a flexible discretionary PTO policy with a recommended minimum of 20 days off per year. The company observes 12 paid public holidays plus a winter shutdown between Christmas and New Year...",
  },
];

// ---------------------------------------------------------------------------
// Access & Equipment Requests
// ---------------------------------------------------------------------------
export const INITIAL_REQUESTS: AccessRequestItem[] = [
  {
    id: "REQ-1048",
    type: "Cloud & Infrastructure",
    toolName: "AWS Staging & Dev Cluster Sandbox",
    justification: "Needed to deploy and test microservice changes locally and in the staging cluster.",
    priority: "High",
    status: "Pending",
    submittedAt: "Today, 10:15 AM",
    approver: "David Kim (VP of Engineering)",
  },
  {
    id: "REQ-1045",
    type: "Software",
    toolName: "GitHub Enterprise Write Permissions",
    justification: "Core Infrastructure repository contributor access for daily coding and PR review.",
    priority: "High",
    status: "Approved",
    submittedAt: "Yesterday, 3:30 PM",
    approver: "Sarah Chen (Buddy / Lead)",
  },
  {
    id: "REQ-1042",
    type: "Hardware",
    toolName: "Dell UltraSharp 27-inch 4K USB-C Monitor",
    justification: "Home workstation dual-monitor setup under the new hire ergonomics allowance.",
    priority: "Medium",
    status: "Approved",
    submittedAt: "Sep 16, 2026",
    approver: "IT Logistics Team",
  },
  {
    id: "REQ-1039",
    type: "Software",
    toolName: "Datadog APM & Logs Viewer Seat",
    justification: "Observability diagnostics for core services and latency monitoring.",
    priority: "Low",
    status: "In Review",
    submittedAt: "Sep 16, 2026",
    approver: "Marcus Johnson (IT Ops)",
  },
];

// Catalog of tools available for quick selection in requests
export const REQUEST_CATALOG = {
  Software: [
    "GitHub Enterprise Write Access",
    "Figma Professional Seat",
    "JetBrains All Products License",
    "Datadog APM & Logs Viewer",
    "Slack Enterprise Channels",
    "Postman Enterprise Team",
    "Linear Product Workspace",
  ],
  Hardware: [
    "Dell UltraSharp 27-inch 4K USB-C Monitor",
    "Apple Magic Keyboard & Trackpad",
    "Logitech MX Master 3S Wireless Mouse",
    "CalDigit TS4 Thunderbolt 4 Dock",
    "Jabra Evolve2 Noise-Cancelling Headset",
  ],
  "Cloud & Infrastructure": [
    "AWS Staging & Dev Sandbox",
    "GCP Core Services Project Access",
    "Kubernetes Production Read-Only Role",
    "Tailscale Zero-Trust VPN Admin Access",
    "Cloudflare Tunnel Developer Seat",
  ],
  General: [
    "Regional Co-Working Pass (WeWork / Deskpass)",
    "Corporate Uber for Business Account",
    "O'Reilly Learning Platform Subscription",
  ],
};

// ---------------------------------------------------------------------------
// Team Directory
// ---------------------------------------------------------------------------
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-sarah",
    name: "Sarah Chen",
    role: "Staff Platform Architect",
    department: "Core Infrastructure",
    email: "sarah.chen@enterprise.io",
    slackHandle: "@sarah.chen",
    phone: "+1 (415) 555-0142",
    timezone: "US Pacific (PST)",
    isMentor: true,
    avatarInitials: "SC",
    directoryLabel: "Onboarding Buddy",
  },
  {
    id: "user-david",
    name: "David Kim",
    role: "VP of Engineering",
    department: "Engineering Leadership",
    email: "david.kim@enterprise.io",
    slackHandle: "@david.kim",
    phone: "+1 (212) 555-0198",
    timezone: "US Eastern (EST)",
    isMentor: false,
    avatarInitials: "DK",
    directoryLabel: "Manager",
  },
  {
    id: "user-marcus",
    name: "Marcus Johnson",
    role: "Lead Systems Administrator",
    department: "Information Technology",
    email: "marcus.j@enterprise.io",
    slackHandle: "@marcus.it",
    phone: "+1 (312) 555-0164",
    timezone: "US Central (CST)",
    isMentor: false,
    avatarInitials: "MJ",
    directoryLabel: "IT Support",
  },
  {
    id: "user-emily",
    name: "Emily Taylor",
    role: "Principal People Partner",
    department: "People Operations",
    email: "emily.taylor@enterprise.io",
    slackHandle: "@emily.hr",
    phone: "+1 (415) 555-0117",
    timezone: "US Pacific (PST)",
    isMentor: false,
    avatarInitials: "ET",
    directoryLabel: "HR",
  },
  {
    id: "user-jordan",
    name: "Jordan Lee",
    role: "Senior Frontend Engineer",
    department: "Design Systems",
    email: "jordan.lee@enterprise.io",
    slackHandle: "@jordan.lee",
    phone: "+44 20 7946 0958",
    timezone: "Europe/London (GMT)",
    isMentor: false,
    avatarInitials: "JL",
  },
];

// ---------------------------------------------------------------------------
// Conversational AI Mock Prompts & Contextual Responses
// ---------------------------------------------------------------------------
export const SUGGESTED_CHAT_PROMPTS = [
  "How do I request GitHub write access?",
  "What is our home office equipment allowance and how do I expense it?",
  "Where can I find our git branch naming conventions and PR review SLAs?",
  "How does our 401(k) matching and annual health stipend work?",
];

export const MOCK_AI_RESPONSES: Record<string, { answer: string; sources: string[] }> = {
  default: {
    answer: "I found relevant guidance in the company onboarding documentation. As a new hire, your standard setup includes automated 2FA provisioning, an equipment stipend, and an assigned onboarding buddy. Let me know if you need specific details about expenses, engineering standards, or time off!",
    sources: ["employee_handbook_v2.md", "onboarding_welcome_guide.md"],
  },
  equipment: {
    answer: "### Home Office & Equipment Policy Summary\n\n• **Ergonomics Stipend**: All full-time new hires receive a **$1,000 one-time allowance** to purchase monitors, desks, chairs, and accessories.\n• **Standard Hardware**: A company-managed MacBook Pro M3 or ThinkPad P-series is provided by IT Logistics.\n• **Reimbursement**: Submit your itemized receipts in **Ramp** under the *'Home Office Setup'* category within 30 days of purchase.",
    sources: ["remote_work_policy_2026.md §4.1", "ramp_expense_guide.md"],
  },
  git: {
    answer: "### Engineering RFC & Git Standards\n\n• **Branch Naming**: Use `feature/<issue-id>-short-description`, `fix/<issue-id>-...`, or `chore/...`.\n• **Pull Request SLA**: Core team PRs must be reviewed within **24 business hours**.\n• **Merge Requirements**: At least 2 approvals from code owners, all CI checks green, and clean linear history (Squash and merge).",
    sources: ["engineering_playbook_v3.md §2", "github_workflow_standards.md"],
  },
  hours: {
    answer: "### Core Working Hours & Collaboration\n\n• **Core Hours**: **10:00 AM – 3:00 PM** in your local home time zone for synchronous meetings and standups.\n• **Deep Work Days**: No internal meetings scheduled on **Tuesdays and Thursdays after 1:00 PM**.\n• **Communication**: Asynchronous communication via Slack channels and Linear updates is standard.",
    sources: ["remote_work_policy_2026.md §2.3"],
  },
  benefits: {
    answer: "### Benefits & 401(k) Matching\n\n• **Medical, Dental & Vision**: Coverage begins on your first day. Check your benefits portal login sent via email.\n• **401(k) Matching**: 100% dollar-for-dollar match on your first **5% of base salary**, vesting immediately.\n• **Wellness Perk**: **$1,200 annual wellness credit** available through your Ramp virtual card for gym memberships, therapy, or fitness equipment.",
    sources: ["benefits_summary_2026.pdf", "401k_plan_document.pdf"],
  },
  github: {
    answer: "### GitHub access for new engineers\n\n• Submit an **Access Request** for **GitHub Enterprise Write Access** from the Access Request page.\n• Your manager (David Kim) and onboarding buddy typically approve within one business day.\n• After approval, IT adds you to the Core Infrastructure GitHub team so you can clone repos and open pull requests.\n• Until write access lands, you can still read the Engineering Setup playbook and complete local toolchain setup.",
    sources: ["onboarding_welcome_guide.md §3.2", "github_workflow_standards.md", "it_access_catalog.md"],
  },
};
