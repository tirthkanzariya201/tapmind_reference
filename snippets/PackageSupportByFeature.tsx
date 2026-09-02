'use client';

import { useMemo, useState } from 'react';
import matrixInternals from './matrixInternals';

const SHIPPED = 'shipped';
const UNCONFIRMED = 'shipped_unconfirmed';
const NOT_BUILT = 'not_built';
const NOT_APPLICABLE = 'not_applicable';

function PackageList({
  title,
  items,
  featureKey,
}: {
  title: string;
  items: (typeof matrixInternals.MATRIX_DATA.products)[number]['packages'];
  featureKey: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="matrix-feature-group mb-5">
      <h4 className="mb-2 text-sm font-semibold text-slate-800">{title}</h4>
      <ul className="space-y-2">
        {items.map((pkg) => {
          const feature = pkg.features[featureKey as keyof typeof pkg.features];
          return (
            <li
              key={`${pkg.product_id}-${pkg.name}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-900">{pkg.name}</span>
              <span className="text-slate-600">
                {pkg.package_version || 'Not published'}
                {feature?.shipped_in_version ? ` · shipped in ${feature.shipped_in_version}` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProductFeatureSection({
  product,
  featureKey,
  scopedPackages,
}: {
  product: (typeof matrixInternals.MATRIX_DATA.products)[number];
  featureKey: string;
  scopedPackages: (typeof matrixInternals.MATRIX_DATA.products)[number]['packages'];
}) {
  const buckets = useMemo(() => {
    const shipped: typeof scopedPackages = [];
    const unconfirmed: typeof scopedPackages = [];
    const notBuilt: typeof scopedPackages = [];
    const notApplicable: typeof scopedPackages = [];

    for (const pkg of scopedPackages) {
      const status = pkg.features[featureKey as keyof typeof pkg.features]?.status;
      if (status === SHIPPED) shipped.push(pkg);
      else if (status === UNCONFIRMED) unconfirmed.push(pkg);
      else if (status === NOT_APPLICABLE) notApplicable.push(pkg);
      else notBuilt.push(pkg);
    }

    return { shipped, unconfirmed, notBuilt, notApplicable };
  }, [scopedPackages, featureKey]);

  return (
    <section className="matrix-product-section rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 border-b border-slate-100 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#FE7B49]">{product.name}</p>
        <p className="mt-1 text-sm text-slate-600">
          Shipped {buckets.shipped.length}, unconfirmed {buckets.unconfirmed.length}, not yet built{' '}
          {buckets.notBuilt.length}
          {buckets.notApplicable.length > 0 ? `, not applicable ${buckets.notApplicable.length}` : ''}
        </p>
      </header>

      <PackageList title="Shipped" items={buckets.shipped} featureKey={featureKey} />
      <PackageList title="Shipped but unconfirmed" items={buckets.unconfirmed} featureKey={featureKey} />
      <PackageList title="Not yet built" items={buckets.notBuilt} featureKey={featureKey} />

      {buckets.notApplicable.length > 0 && (
        <details className="matrix-na-block mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Not applicable ({buckets.notApplicable.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {buckets.notApplicable.map((pkg) => (
              <li key={`${pkg.product_id}-${pkg.name}`} className="text-sm text-slate-600">
                {pkg.name}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function PackageSupportByFeature() {
  const { ALL, MATRIX_DATA, FilterBar, filterPackages, useAllPackages } = matrixInternals;
  const allPackages = useAllPackages();
  const [featureKey, setFeatureKey] = useState(MATRIX_DATA.feature_order[0]);
  const [filters, setFilters] = useState({
    product: ALL,
    framework: ALL,
    platform: ALL,
    mediation: ALL,
  });

  const feature = MATRIX_DATA.feature_definitions[featureKey as keyof typeof MATRIX_DATA.feature_definitions];
  const matched = useMemo(() => filterPackages(allPackages, filters), [allPackages, filters, filterPackages]);

  const visibleProducts = useMemo(() => {
    if (filters.product !== ALL) {
      return MATRIX_DATA.products.filter((product) => product.id === filters.product);
    }
    return MATRIX_DATA.products;
  }, [filters.product, ALL, MATRIX_DATA.products]);

  return (
    <div className="matrix-page space-y-6">
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        packages={allPackages}
        showFeature
        featureFirst
        featureKey={featureKey}
        setFeatureKey={setFeatureKey}
      />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{feature.display_name}</h3>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">{feature.description}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Scope: {feature.scope}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {visibleProducts.map((product) => {
          const scopedPackages = matched.filter((pkg) => pkg.product_id === product.id);
          return (
            <ProductFeatureSection
              key={product.id}
              product={product}
              featureKey={featureKey}
              scopedPackages={scopedPackages}
            />
          );
        })}
      </div>
    </div>
  );
}
