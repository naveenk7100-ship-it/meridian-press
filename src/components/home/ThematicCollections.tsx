import Link from "next/link";
import { ArrowRight, Layers, Type, Feather, Cpu, Compass, BookMarked } from "lucide-react";

const CATEGORY_CARDS = [
  {
    title: "Architecture & Systems",
    description:
      "Structural durability, distributed consensus, failure domains, and long-lived computing artifacts.",
    icon: Layers,
    href: "/books?category=Architecture+%26+Systems",
    tag: "Core Engineering",
  },
  {
    title: "Visual Arts & Typographics",
    description:
      "The physics of reading, optical sizing, grid geometry, and editorial rhythm across digital screens.",
    icon: Type,
    href: "/books?category=Visual+Arts+%26+Typographics",
    tag: "Design & Craft",
  },
  {
    title: "Craft of Technical Writing",
    description:
      "Eliminating jargon, structuring mental models, writing specs, and communicating complex machinery with clarity.",
    icon: Feather,
    href: "/books?category=Craft+of+Writing",
    tag: "Exposition",
  },
  {
    title: "Digital Epistemology",
    description:
      "Formal proof vs. empirical induction, machine opacity, and how humans verify truth in algorithmic systems.",
    icon: Cpu,
    href: "/books?category=Digital+Epistemology",
    tag: "Philosophy",
  },
  {
    title: "Independent Thought",
    description:
      "Solo software craftsmanship, calm economics, sovereign studios, and deliberate independence.",
    icon: Compass,
    href: "/books?category=Independent+Thought",
    tag: "Sovereignty",
  },
  {
    title: "Design Philosophy",
    description:
      "Designing quiet interfaces that respect human dignity, ambient perception, and mental stillness.",
    icon: BookMarked,
    href: "/books?category=Design+Philosophy",
    tag: "Ethics & HCI",
  },
];

export function ThematicCollections() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E7E2D8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
              Taxonomy & Scope
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#14161A] tracking-tight">
              Thematic Collections
            </h2>
          </div>
          <p className="font-sans text-sm text-[#5C5F68] max-w-md">
            Our monographs are organized into foundational disciplines, each edited to balance theoretical rigor with practical execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5] transition-all duration-300 hover:border-[#14161A] hover:bg-[#F4EFE6] hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#F4EFE6] text-[#14161A] group-hover:bg-[#14161A] group-hover:text-[#FAF8F5] transition-colors border border-[#DDD6C9]">
                      <Icon className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#737680] bg-white px-2 py-0.5 rounded-[2px] border border-[#E7E2D8]">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#14161A] group-hover:text-[#B85D19] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#5C5F68] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#EFEBE3] flex items-center justify-between text-xs font-mono text-[#737680] group-hover:text-[#14161A]">
                  <span>Explore monographs</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-[#B85D19]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
