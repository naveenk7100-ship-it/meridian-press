"use client";

import Image from "next/image";
import { Book } from "@/types/book";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  book: Pick<Book, "title" | "subtitle" | "author" | "coverImage" | "coverColorTheme" | "category">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSpine?: boolean;
}

export function BookCover({
  book,
  size = "md",
  className,
  showSpine = true,
}: BookCoverProps) {
  const sizeClasses = {
    sm: "w-28 h-40 text-[10px]",
    md: "w-44 h-64 text-xs",
    lg: "w-64 h-92 text-sm",
    xl: "w-72 sm:w-80 h-[440px] sm:h-[480px] text-base",
  };

  const theme = book.coverColorTheme || {
    background: "#1c2321",
    accent: "#d4a373",
    textColor: "#fefae0",
  };

  return (
    <div
      className={cn(
        "relative rounded-r-md rounded-l-xs overflow-hidden transition-transform duration-300 book-shadow flex-shrink-0 select-none group",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: theme.background,
        color: theme.textColor,
      }}
    >
      {/* 3D Spine Lighting simulation */}
      {showSpine && (
        <div className="absolute inset-y-0 left-0 w-3.5 sm:w-4.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent z-20 pointer-events-none border-r border-black/20" />
      )}

      {/* Book Crease subtle shadow */}
      <div className="absolute inset-y-0 left-3 sm:left-4 w-[1px] bg-black/25 z-20 pointer-events-none" />

      {/* Cover Image or Editorial Typographic Cover */}
      {book.coverImage ? (
        <div className="relative w-full h-full">
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover object-center filter brightness-[0.92] contrast-[1.05] transition-transform duration-500 group-hover:scale-[1.02]"
            priority={size === "xl" || size === "lg"}
          />
          {/* Subtle dark vignette overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 z-10" />

          {/* Overlay Typography */}
          <div className="absolute inset-0 z-15 p-4 sm:p-5 flex flex-col justify-between pl-6">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#E7E2D8]/80 block">
                {book.category}
              </span>
            </div>

            <div className="space-y-1.5 pb-2">
              <h3 className="font-serif font-medium leading-tight text-[#FAF8F5] drop-shadow-sm text-lg sm:text-xl line-clamp-3">
                {book.title}
              </h3>
              <p className="font-sans text-xs text-[#E7E2D8]/90 font-light line-clamp-2">
                {book.subtitle}
              </p>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                <span className="font-serif italic text-xs text-[#FAF8F5]">
                  {book.author.name}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#FAF8F5]/60">
                  Meridian Press
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pure Editorial Typographic Cover */
        <div className="relative w-full h-full p-4 sm:p-6 flex flex-col justify-between pl-7 border border-white/10">
          <div className="space-y-2">
            <span
              className="font-mono text-[9px] uppercase tracking-widest block opacity-75"
              style={{ color: theme.accent }}
            >
              Meridian Monograph № {book.category.substring(0, 3).toUpperCase()}
            </span>
            <div
              className="w-8 h-[2px]"
              style={{ backgroundColor: theme.accent }}
            />
          </div>

          <div className="space-y-2 my-auto">
            <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight tracking-tight">
              {book.title}
            </h3>
            <p className="font-sans text-xs font-light opacity-85 leading-snug line-clamp-3">
              {book.subtitle}
            </p>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="font-serif italic text-xs opacity-90">
              {book.author.name}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest opacity-60">
              Edition 1.0
            </span>
          </div>
        </div>
      )}

      {/* Right Edge Page Texture */}
      <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/30 to-transparent pointer-events-none z-20" />
    </div>
  );
}
