import { isDev } from '@/lib/env';

export function TailwindIndicator() {
  if (!isDev) return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex size-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      <div className="block break-normal sm:hidden">xs</div>
      <div className="hidden break-normal sm:block md:hidden">sm</div>
      <div className="hidden break-normal md:block lg:hidden">md</div>
      <div className="hidden break-normal lg:block xl:hidden">lg</div>
      <div className="hidden break-normal xl:block 2xl:hidden">xl</div>
      <div className="hidden break-normal 2xl:block">2xl</div>
    </div>
  );
}
