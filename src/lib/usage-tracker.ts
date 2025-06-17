interface UsageRecord {
  userId: string;
  feature: string;
  timestamp: number;
  week: string; // Format: YYYY-WXX
}

// In-memory storage for now (you'll want to move this to your database)
const usageStore = new Map<string, UsageRecord[]>();

export function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay()) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

export function trackUsage(userId: string, feature: string): void {
  const key = `${userId}-${feature}`;
  const currentWeek = getCurrentWeek();
  
  if (!usageStore.has(key)) {
    usageStore.set(key, []);
  }
  
  const records = usageStore.get(key)!;
  records.push({
    userId,
    feature,
    timestamp: Date.now(),
    week: currentWeek
  });
  
  // Keep only current week's records
  const filteredRecords = records.filter(record => record.week === currentWeek);
  usageStore.set(key, filteredRecords);
}

export function getUsageCount(userId: string, feature: string): number {
  const key = `${userId}-${feature}`;
  const currentWeek = getCurrentWeek();
  
  if (!usageStore.has(key)) {
    return 0;
  }
  
  const records = usageStore.get(key)!;
  return records.filter(record => record.week === currentWeek).length;
}

export function hasReachedLimit(userId: string, feature: string, limit: number): boolean {
  return getUsageCount(userId, feature) >= limit;
}

export function getRemainingUsage(userId: string, feature: string, limit: number): number {
  const used = getUsageCount(userId, feature);
  return Math.max(0, limit - used);
} 