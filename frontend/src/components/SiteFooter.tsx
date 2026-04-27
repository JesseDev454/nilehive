export function SiteFooter({ className = "" }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-foreground/15 bg-background/95 px-4 py-4 text-center text-xs text-muted-foreground ${className}`.trim()}>
      <p>&copy; {year} Nile University of Nigeria. NUN Club Services is a Nile University of Nigeria product.</p>
    </footer>
  );
}
