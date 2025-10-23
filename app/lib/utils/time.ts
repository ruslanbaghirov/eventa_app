// app/lib/utils/time.ts

/**
 * TIME UTILITY FUNCTIONS
 *
 * Helper functions for formatting dates and times in human-readable format
 * Used for showing "Updated X ago" badges on event cards
 */

/**
 * Formats a date into "X time ago" format
 * Examples: "2 minutes ago", "3 hours ago", "5 days ago"
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (seconds < 60) {
    return "just now";
  }

  // Minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Days
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Weeks
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  // Months
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  // Years
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

/**
 * Checks if an event was recently updated (within last 7 days)
 * AND was actually edited (not just created)
 *
 * @param updatedAt - The updated_at timestamp from database
 * @param createdAt - The created_at timestamp from database
 * @returns true if event was edited within last 7 days
 */
export function wasRecentlyUpdated(
  updatedAt: string,
  createdAt: string
): boolean {
  if (!updatedAt || !createdAt) {
    return false;
  }

  const updated = new Date(updatedAt);
  const created = new Date(createdAt);
  const now = new Date();

  // Check if updated_at is different from created_at (meaning it was edited)
  // Add 1 second buffer to account for database timing
  const wasEdited = updated.getTime() > created.getTime() + 1000;

  if (!wasEdited) {
    return false;
  }

  // Check if update was within last 7 days
  const daysSinceUpdate =
    (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate < 7;
}
