import { useEffect, useState } from 'react';

const steps = [
  { id: 'capture', title: 'Save from anywhere', description: 'Click the extension to capture the tab.' },
  { id: 'organize', title: 'Organize by collection', description: 'Group resources by topic.' },
  { id: 'revisit', title: 'Revisit in the dashboard', description: 'Search and revisit instantly.' },
];

export function SaveAnywhereStrip() {
  const [active, setActive] = useState(steps[0].id);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => steps[(steps.findIndex((s) => s.id === current) + 1) % steps.length].id);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 p-4 md:p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Save from anywhere on the web
        </div>

        <div className="rounded-2xl bg-slate-900 text-slate-50 p-4 text-xs shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500 grid place-items-center text-xs font-bold">
                L
              </div>
              <span className="text-[11px] font-semibold text-slate-200">LinkIt Extension</span>
            </div>
            <button className="px-2 py-1 rounded-lg bg-emerald-500/90 text-[10px] font-semibold hover:bg-emerald-400">
              Add current tab
            </button>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-3 text-[11px] space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Title</span>
              <span className="text-[10px] text-slate-400">2/40</span>
            </div>
            <div className="h-6 rounded-md bg-slate-700/80" />
            <div className="flex justify-between text-slate-300">
              <span>Collection</span>
              <span className="text-[10px] text-slate-400">Leetcode prep</span>
            </div>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-1 rounded-lg bg-slate-700/80 text-[10px]">DSA</span>
              <span className="px-2 py-1 rounded-lg bg-slate-700/80 text-[10px]">System Design</span>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-semibold text-slate-700">Dashboard preview</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white border border-slate-200 h-16 shadow-sm flex flex-col justify-between p-2"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100" />
                <div className="h-1.5 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-3 py-2 rounded-xl border text-left transition ${
              active === s.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="font-semibold text-[11px]">{s.title}</div>
            <div className="text-[10px] mt-1">{s.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

