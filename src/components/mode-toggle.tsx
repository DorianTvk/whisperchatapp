
// This file is kept for backward compatibility but no longer needed for theme switching
// Theme switching is now handled in the Profile page under the Appearance tab

import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  // This component is now a no-op, as theme toggling has been moved to the Profile page
  return null;
}
