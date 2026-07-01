export const apiLogsMock = [
  {
    id: "log-1",
    apiKey: "e2d0098d7ad7...7b050812",
    role: "Standard User",
    status: "Active",
    lastUsed: "2026-07-01 14:35:10",
    requestsCount: 4120,
    rateLimit: "1,000/min"
  },
  {
    id: "log-2",
    apiKey: "1816ccd61807...da6fda54",
    role: "Admin",
    status: "Active",
    lastUsed: "2026-07-01 14:38:20",
    requestsCount: 890,
    rateLimit: "Unlimited"
  },
  {
    id: "log-3",
    apiKey: "ca2b3c9da6fd...3efd0354",
    role: "Standard User",
    status: "Active",
    lastUsed: "2026-06-30 18:22:45",
    requestsCount: 1205,
    rateLimit: "1,000/min"
  },
  {
    id: "log-4",
    apiKey: "8d7ad7aaa3ef...ec1244ca",
    role: "Standard User",
    status: "Revoked",
    lastUsed: "2026-06-25 10:12:00",
    requestsCount: 304,
    rateLimit: "1,000/min"
  },
  {
    id: "log-5",
    apiKey: "5ec1244ca2b3...d5ed59cb",
    role: "Standard User",
    status: "Expired",
    lastUsed: "2026-05-15 08:30:11",
    requestsCount: 5210,
    rateLimit: "1,000/min"
  }
];

export const platformHealthMock = {
  apiUptime: "99.98%",
  dbLatency: "24ms",
  serverStatus: "All Systems Operational",
  lastCheck: "2 mins ago"
};
