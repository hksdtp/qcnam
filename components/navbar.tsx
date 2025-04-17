"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, PlusCircle, Settings, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
    },
    {
      name: "Add Transaction",
      href: "/transactions/new",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
    },
    {
      name: "Diagnostic",
      href: "/advanced-diagnostic",
      icon: <Wrench className="mr-2 h-4 w-4" />,
    },
    {
      name: "Create Sheet1",
      href: "/create-sheet1",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl text-primary">
            Báo cáo chi phí
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant={pathname === item.href ? "default" : "secondary"} size="sm">
              <Link href={item.href}>
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="block md:hidden">
            <MobileNav items={navItems} pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileNav({
  items,
  pathname,
}: {
  items: { name: string; href: string; icon: React.ReactNode }[]
  pathname: string
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background text-foreground">
        <nav className="flex flex-col gap-4 mt-8">
          {items.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "default" : "secondary"}
              className="justify-start"
            >
              <Link href={item.href}>
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
