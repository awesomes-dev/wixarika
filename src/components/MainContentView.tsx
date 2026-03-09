type MainContentViewProps = {
  containerRef: preact.RefObject<HTMLDivElement | null>;
};

export function MainContentView({ containerRef }: MainContentViewProps) {
  return (
    <main class="flex-1 min-w-0 flex flex-col overflow-hidden bg-base-100" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div ref={containerRef} class="flex-1 min-h-0 w-full" />
    </main>
  );
}
