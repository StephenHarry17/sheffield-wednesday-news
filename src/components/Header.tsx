'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

const navLinks = ["Home", "News", "Matches", "Videos", "Opinion", "Fan Zone", "Club"];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#003399] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-9 w-9">
              <Image
                src="/logo.png"
                alt="Sheffield Wednesday"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Sheffield Wednesday News
            </span>
            <span className="font-bold text-base tracking-tight sm:hidden">
              SW News
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const href =
                link === "Home"
                  ? "/"
                  : link === "News"
                  ? "/news"
                  : link === "Matches"
                  ? "/matches"
                  : link === "Videos"
                  ? "/videos"
                  : `/${link.toLowerCase().replace(" ", "-")}`;

              return (
                <Link
                  key={link}
                  href={href}
                  className="px-3 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                >
                  {link}
                </Link>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Toggle search"
            >
              <Search size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 md:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-3 flex flex-col gap-1"
          >
            {navLinks.map((link) => {
              const href =
                link === "Home"
                  ? "/"
                  : link === "News"
                  ? "/news"
                  : link === "Matches"
                  ? "/matches"
                  : link === "Videos"
                  ? "/videos"
                  : `/${link.toLowerCase().replace(" ", "-")}`;

              return (
                <Link
                  key={link}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-3 py-2 rounded hover:bg-white/10 transition-colors text-sm"
                >
                  {link}
                </Link>
              );
            })}
          </motion.nav>
        )}

        {/* Search bar */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-3"
          >
            <Input
              placeholder="Search…"
              className="bg-white text-gray-900"
              autoFocus
            />
          </motion.div>
        )}
      </div>
    </header>
  );
}