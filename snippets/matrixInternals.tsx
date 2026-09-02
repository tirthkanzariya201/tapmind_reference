'use client';

import { useMemo } from 'react';
import MATRIX_DATA from './MATRIX_DATA';

type MatrixPackage = (typeof MATRIX_DATA.products)[number]['packages'][number];

const ALL = 'All';

function filterPackages(
  packages: MatrixPackage[],
  filters: { product: string; framework: string; platform: string; mediation: string }
) {
  return packages.filter((pkg) => {
    if (filters.product !== ALL && pkg.product_id !== filters.product) return false;
    if (filters.framework !== ALL && pkg.framework !== filters.framework) return false;
    if (filters.platform !== ALL && pkg.platform !== filters.platform) return false;
    if (filters.mediation !== ALL && pkg.mediation !== filters.mediation) return false;
    return true;
  });
}

function uniqueValues(packages: MatrixPackage[], field: keyof MatrixPackage) {
  return [...new Set(packages.map((pkg) => String(pkg[field])))].sort();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    shipped: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    shipped_unconfirmed: 'bg-amber-100 text-amber-900 border-amber-200',
    not_applicable: 'bg-slate-100 text-slate-600 border-slate-200',
    not_built: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const labels: Record<string, string> = {
    shipped: 'Shipped',
    shipped_unconfirmed: 'Shipped, unconfirmed',
    not_applicable: 'Not applicable',
    not_built: 'Not yet built',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.not_built}`}
    >
      {labels[status] || status}
    </span>
  );
}

function FilterBar({
  filters,
  setFilters,
  packages,
  showFeature = false,
  featureFirst = false,
  featureKey,
  setFeatureKey,
}: {
  filters: { product: string; framework: string; platform: string; mediation: string };
  setFilters: (next: typeof filters) => void;
  packages: MatrixPackage[];
  showFeature?: boolean;
  featureFirst?: boolean;
  featureKey?: string;
  setFeatureKey?: (value: string) => void;
}) {
  const products = MATRIX_DATA.products;
  const frameworks = uniqueValues(packages, 'framework');
  const platforms = uniqueValues(packages, 'platform');
  const mediations = uniqueValues(packages, 'mediation');

  const selectClass =
    'matrix-filter-select rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm';

  const productFilter = (
    <label className="matrix-filter-field">
      <span className="matrix-filter-label">Product</span>
      <select
        className={selectClass}
        value={filters.product}
        onChange={(e) => setFilters({ ...filters, product: e.target.value })}
      >
        <option value={ALL}>{ALL}</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
    </label>
  );

  const featureFilter =
    showFeature && featureKey !== undefined && setFeatureKey ? (
      <label className="matrix-filter-field">
        <span className="matrix-filter-label">Feature</span>
        <select className={selectClass} value={featureKey} onChange={(e) => setFeatureKey(e.target.value)}>
          {MATRIX_DATA.feature_order.map((key) => (
            <option key={key} value={key}>
              {MATRIX_DATA.feature_definitions[key].display_name}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  return (
    <div className="matrix-filter-bar grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {featureFirst ? featureFilter : productFilter}
      {featureFirst ? productFilter : featureFilter}

      <label className="matrix-filter-field">
        <span className="matrix-filter-label">Framework</span>
        <select
          className={selectClass}
          value={filters.framework}
          onChange={(e) => setFilters({ ...filters, framework: e.target.value })}
        >
          <option value={ALL}>{ALL}</option>
          {frameworks.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="matrix-filter-field">
        <span className="matrix-filter-label">Platform</span>
        <select
          className={selectClass}
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
        >
          <option value={ALL}>{ALL}</option>
          {platforms.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="matrix-filter-field">
        <span className="matrix-filter-label">Mediation</span>
        <select
          className={selectClass}
          value={filters.mediation}
          onChange={(e) => setFilters({ ...filters, mediation: e.target.value })}
        >
          <option value={ALL}>{ALL}</option>
          {mediations.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: MatrixPackage }) {
  return (
    <section className="matrix-package-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="matrix-package-header mb-4 border-b border-slate-100 pb-4">
        <p className="matrix-product-label text-xs font-semibold uppercase tracking-wide text-[#FE7B49]">
          {pkg.product_name}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{pkg.name}</h3>
        <p className="mt-2 text-sm text-slate-600">
          Current package version:{' '}
          <strong>{pkg.package_version || 'Not published'}</strong>
          {pkg.native_built_on ? (
            <>
              {' '}
              (native built on <strong>{pkg.native_built_on}</strong>)
            </>
          ) : null}
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="matrix-feature-table w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4 font-semibold">Feature</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Shipped in version</th>
              <th className="py-2 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX_DATA.feature_order.map((key) => {
              const feature = pkg.features[key];
              return (
                <tr key={key} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4 font-medium text-slate-900">{feature.display_name}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={feature.status} />
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{feature.shipped_in_version || '-'}</td>
                  <td className="py-3 text-slate-600">{feature.note || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function useAllPackages() {
  return useMemo(() => MATRIX_DATA.products.flatMap((product) => product.packages), []);
}

export const matrixInternals = {
  ALL,
  MATRIX_DATA,
  filterPackages,
  FilterBar,
  PackageCard,
  useAllPackages,
};
