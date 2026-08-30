'use client';

import { useMemo, useState } from 'react';
import {
  ALL,
  FilterBar,
  PackageCard,
  filterPackages,
  useAllPackages,
} from './matrix-shared';

export function FeatureSupportByPackage() {
  const allPackages = useAllPackages();
  const [filters, setFilters] = useState({
    product: ALL,
    framework: ALL,
    platform: ALL,
    mediation: ALL,
  });

  const matched = useMemo(() => filterPackages(allPackages, filters), [allPackages, filters]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof matched>();
    for (const pkg of matched) {
      const key = `${pkg.product_id}::${pkg.name}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(pkg);
    }
    return [...map.values()].map((items) => items[0]);
  }, [matched]);

  return (
    <div className="matrix-page space-y-6">
      <FilterBar filters={filters} setFilters={setFilters} packages={allPackages} />

      <p className="text-sm text-slate-600">
        Showing <strong>{grouped.length}</strong> package
        {grouped.length === 1 ? '' : 's'}. Each card is labeled with its product so GMA and Next-Gen
        packages are never merged.
      </p>

      {grouped.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          No packages match these filters.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((pkg) => (
            <PackageCard key={`${pkg.product_id}-${pkg.name}`} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
