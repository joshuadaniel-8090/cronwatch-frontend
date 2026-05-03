
// Simple in-memory mock database using globalThis to persist across module reloads in dev
const globalWithMonitors = globalThis as unknown as { 
  monitors: any[] | undefined 
};

const INITIAL_MONITORS = [
  {
    id: "mon_1",
    name: "Production API",
    slug: "prod-api",
    status: "healthy",
    interval_seconds: 60,
    grace_seconds: 30,
    last_ping_at: new Date().toISOString(),
    last_ping_status: "success",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    token: "tok_abc123",
  },
  {
    id: "mon_2",
    name: "Backup Worker",
    slug: "backup-worker",
    status: "failing",
    interval_seconds: 3600,
    grace_seconds: 600,
    last_ping_at: new Date(Date.now() - 7200000).toISOString(),
    last_ping_status: "late",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    token: "tok_xyz789",
  },
  {
    id: "mon_3",
    name: "Database Sync",
    slug: "db-sync",
    status: "recovered",
    interval_seconds: 300,
    grace_seconds: 60,
    last_ping_at: new Date(Date.now() - 120000).toISOString(),
    last_ping_status: "recovery",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    token: "tok_db123",
  }
];

if (!globalWithMonitors.monitors) {
  globalWithMonitors.monitors = [...INITIAL_MONITORS];
}

export const getMonitors = () => {
  if (!globalWithMonitors.monitors) {
    globalWithMonitors.monitors = [...INITIAL_MONITORS];
  }
  return globalWithMonitors.monitors;
};

// For backward compatibility while I update calls
export const monitors = getMonitors();

export const deleteMonitor = (id: string) => {
  const monitorsArray = getMonitors();
  const index = monitorsArray.findIndex(m => m.id === id);
  if (index !== -1) {
    monitorsArray.splice(index, 1);
    console.log(`[DB] Deleted monitor ${id}. Count: ${monitorsArray.length}`);
    return { success: true };
  }
  const availableIds = monitorsArray.map(m => m.id).join(', ');
  console.log(`[DB] Failed to delete monitor ${id}. Available: ${availableIds}`);
  return { success: false, availableIds };
};

export const getMonitor = (id: string) => {
  return getMonitors().find(m => m.id === id);
};

export const createMonitor = (data: any) => {
  const monitorsArray = getMonitors();
  const newMonitor = {
    id: `mon_${Math.random().toString(36).substr(2, 9)}`,
    status: "pending",
    last_ping_at: null,
    created_at: new Date().toISOString(),
    token: `tok_${Math.random().toString(36).substr(2, 12)}`,
    name: data.name || "Untitled Monitor",
    slug: (data.name || "untitled").toLowerCase().replace(/\s+/g, '-'),
    ...data
  };
  monitorsArray.push(newMonitor);
  return newMonitor;
};

export const updateMonitor = (id: string, data: any) => {
  const monitorsArray = getMonitors();
  const index = monitorsArray.findIndex(m => m.id === id);
  if (index !== -1) {
    monitorsArray[index] = { ...monitorsArray[index], ...data };
    return monitorsArray[index];
  }
  return null;
};
