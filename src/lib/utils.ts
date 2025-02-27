
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for chat messages
export function formatMessageDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Today
  if (diffDays === 0) {
    // Less than a minute ago
    if (diffMins === 0) {
      return 'Just now';
    }
    // Less than an hour ago
    if (diffHours === 0) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    }
    // Format hours ago or time
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  // Within the last week
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear() !== now.getFullYear() ? `, ${date.getFullYear()}` : '';
  
  return `${month} ${day}${year}`;
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.charAt(0).toUpperCase();
  }
  
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
