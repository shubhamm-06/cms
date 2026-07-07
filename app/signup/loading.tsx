function AuthLoadingCard({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl place-items-center sm:min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-5xl">
          <div className="mb-5 flex items-center justify-between px-1 sm:mb-6">
            <div className="h-10 w-40 rounded-lg bg-[#e8dfd2]" />
            <div className="h-9 w-24 rounded-md bg-[#e8dfd2]" />
          </div>
          <div className="grid overflow-hidden rounded-[18px] border border-[#e1d8ca] bg-white shadow-[0_24px_70px_rgba(32,24,18,0.12)] md:grid-cols-[0.92fr_1fr]">
            <div className="hidden bg-[#211d1a] p-8 md:block lg:p-10">
              <div className="h-7 w-28 rounded-full bg-white/10" />
              <div className="mt-10 h-24 max-w-sm rounded-xl bg-white/10" aria-label={title} />
              <div className="mt-5 h-16 max-w-sm rounded-xl bg-white/10" />
              <div className="mt-14 space-y-3">
                <div className="h-12 rounded-xl bg-white/10" />
                <div className="h-12 rounded-xl bg-white/10" />
                <div className="h-12 rounded-xl bg-white/10" />
              </div>
            </div>
            <div className="bg-[#fffdf9] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
              <div className="h-10 w-10 rounded-xl bg-[var(--brand-soft)]" />
              <div className="mt-4 h-8 w-60 rounded bg-[#eee5d8]" />
              <div className="mt-3 h-4 max-w-sm rounded bg-[#eee5d8]" />
              <div className="mt-6 space-y-3.5">
                <div className="h-16 rounded-lg bg-[#f2ebe1]" />
                <div className="h-16 rounded-lg bg-[#f2ebe1]" />
                <div className="h-16 rounded-lg bg-[#f2ebe1]" />
                <div className="h-16 rounded-lg bg-[#f2ebe1]" />
                <div className="h-11 rounded-lg bg-[var(--brand-soft)]" />
                <div className="h-11 rounded-lg bg-[#f2ebe1]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupLoading() {
  return <AuthLoadingCard title="Loading signup" />;
}
