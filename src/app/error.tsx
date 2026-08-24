"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="font-bold text-[#14213D]">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-[#14213D] px-4 py-2 text-sm text-white">Try again</button>
      </div>
    </div>
  );
}
