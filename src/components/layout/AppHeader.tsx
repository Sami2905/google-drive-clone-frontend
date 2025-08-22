'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandPalette } from '@/components/command-palette';
import { Menu, Command, Trash2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AvatarMenu from './AvatarMenu';
import Sidebar from './Sidebar';

export default function AppHeader() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Mobile-only hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              {/* Sheet content also mobile-only */}
              <SheetContent side="left" className="p-0 md:hidden">
                <Sidebar variant="sheet" />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-600 to-sky-500" />
              <span className="text-sm font-semibold">Nimbus Drive</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex"
                    onClick={() => router.push('/trash')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Trash</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const cmd = document.querySelector('[data-trigger="command-palette"]');
                      if (cmd instanceof HTMLElement) cmd.click();
                    }}
                  >
                    <Command className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Command Menu (⌘K)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeToggle />
                </TooltipTrigger>
                <TooltipContent>Toggle Theme</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <AvatarMenu />
          </div>
        </div>
      </header>
      <CommandPalette />
    </>
  );
}