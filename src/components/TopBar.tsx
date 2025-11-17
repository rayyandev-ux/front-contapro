import Link from "next/link";

export default function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <Link
        href="https://github.com/"
        className="text-sm text-muted-foreground hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </Link>
    </div>
  );
}