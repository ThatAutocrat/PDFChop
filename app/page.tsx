import Link from "next/link";
import { FileText, Scissors, Archive, RotateCw, Trash2, Image, FileImage, ArrowRight, Shield, Zap, Globe, PenLine } from "lucide-react";

const tools = [
  {
    href: "/tools/edit",
    icon: PenLine,
    label: "Edit PDF",
    desc: "Add text, draw, highlight and annotate pages",
    color: "from-yellow-500/20 to-yellow-500/5",
    iconColor: "text-yellow-400",
    badge: "New",
  },
  {
    href: "/tools/merge",
    icon: FileText,
    label: "Merge PDFs",
    desc: "Combine multiple PDF files into one document",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    href: "/tools/split",
    icon: Scissors,
    label: "Split PDF",
    desc: "Extract pages or split into multiple files",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    href: "/tools/compress",
    icon: Archive,
    label: "Compress PDF",
    desc: "Reduce file size without losing quality",
    color: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-400",
  },
  {
    href: "/tools/reorder",
    icon: RotateCw,
    label: "Reorder Pages",
    desc: "Drag and drop to rearrange PDF pages",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-400",
  },
  {
    href: "/tools/delete-pages",
    icon: Trash2,
    label: "Delete Pages",
    desc: "Remove specific pages from your PDF",
    color: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-400",
  },
  {
    href: "/tools/rotate",
    icon: RotateCw,
    label: "Rotate Pages",
    desc: "Rotate individual or all pages in your PDF",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
  {
    href: "/tools/images-to-pdf",
    icon: Image,
    label: "Images to PDF",
    desc: "Convert JPG and PNG images to a PDF file",
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
  },
  {
    href: "/tools/pdf-to-images",
    icon: FileImage,
    label: "PDF to Images",
    desc: "Export every PDF page as a PNG image",
    color: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-400",
  },
];

const features = [
  { icon: Shield, label: "100% Private", desc: "Files never leave your browser. Zero uploads." },
  { icon: Zap, label: "Instant", desc: "All processing happens locally on your device." },
  { icon: Globe, label: "No account", desc: "No sign up, no email, no limits. Just use it." },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-yellow-400 flex items-center justify-center">
            <FileText className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">PDFChop</span>
        </div>
        <span className="text-xs text-white/30 font-mono">free · private · fast</span>
      </nav>

      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          No uploads. Runs in your browser.
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          PDF tools that actually{" "}
          <span className="text-yellow-400">work</span>
        </h1>
        <p className="text-white/50 text-lg leading-relaxed">
          Merge, split, compress, convert — everything you need, nothing you don&apos;t.
          No paywalls, no watermarks, no nonsense.
        </p>
      </section>

      <section className="px-6 mb-16">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] flex-1">
              <Icon className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-white/30 text-xs font-mono uppercase tracking-widest mb-6 text-center">
          Choose a tool
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(({ href, icon: Icon, label, desc, color, iconColor, badge }, i) => (
            <Link
              key={href}
              href={href}
              className="tool-card group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] cursor-pointer block"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {badge && (
                <span className="absolute top-4 right-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 font-mono">
                  {badge}
                </span>
              )}
              <h3 className="text-white font-semibold text-sm mb-1">{label}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 absolute top-5 right-5 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-6 text-center">
        <p className="text-white/20 text-xs font-mono">
          PDFChop — All processing happens locally. Your files stay yours.
        </p>
      </footer>
    </main>
  );
}
