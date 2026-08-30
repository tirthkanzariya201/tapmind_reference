/**
 * Regenerates feature_matrix.yaml package_version fields from package_versions.yaml.
 * Feature statuses are preserved in feature_matrix.yaml; run after version updates only
 * if you move versions fully into package_versions.yaml only.
 *
 * For now, this script validates both files stay aligned on package names and versions.
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const versionsPath = path.join(root, "package_versions.yaml");
const matrixPath = path.join(root, "feature_matrix.yaml");

function parseSimpleYaml(text) {
  const lines = text.split(/\r?\n/);
  const stack = [{ indent: -1, value: {} }];
  let currentKey = null;
  let listItem = null;

  function setOnTarget(key, val) {
    const parent = stack[stack.length - 1].value;
    if (Array.isArray(parent)) parent[parent.length - 1][key] = val;
    else parent[key] = val;
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+#.*$/, "");
    if (!line.trim()) continue;
    const indent = line.match(/^ */)[0].length;
    const trimmed = line.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();

    if (trimmed.startsWith("- ")) {
      const parent = stack[stack.length - 1].value;
      const content = trimmed.slice(2);
      if (content.includes(":")) {
        const [k, ...rest] = content.split(":");
        const val = rest.join(":").trim();
        const item = { [k.trim()]: parseScalar(val) };
        parent.push(item);
        listItem = item;
        stack.push({ indent, value: item });
      }
      continue;
    }

    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();

    if (!val) {
      const container = {};
      setOnTarget(key, container);
      stack.push({ indent, value: container });
      currentKey = key;
    } else {
      setOnTarget(key, parseScalar(val));
    }
  }

  return stack[0].value;
}

function parseScalar(val) {
  if (!val) return "";
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}

function loadPackagesFromVersions(data) {
  return [...(data.native || []), ...(data.wrappers || [])];
}

function main() {
  if (!fs.existsSync(versionsPath)) {
    console.error("Missing package_versions.yaml");
    process.exit(1);
  }
  if (!fs.existsSync(matrixPath)) {
    console.error("Missing feature_matrix.yaml");
    process.exit(1);
  }

  const versions = parseSimpleYaml(fs.readFileSync(versionsPath, "utf8"));
  const matrix = parseSimpleYaml(fs.readFileSync(matrixPath, "utf8"));
  const versionMap = new Map(
    loadPackagesFromVersions(versions).map((p) => [p.name, p.package_version || ""])
  );

  let mismatches = 0;
  for (const pkg of matrix.packages || []) {
    const expected = versionMap.get(pkg.name);
    if (expected === undefined) {
      console.error(`Matrix package missing from package_versions.yaml: ${pkg.name}`);
      mismatches++;
      continue;
    }
    if ((pkg.package_version || "") !== expected) {
      console.error(
        `Version mismatch for ${pkg.name}: matrix=${pkg.package_version || "(blank)"} versions=${expected || "(blank)"}`
      );
      mismatches++;
    }
  }

  if (mismatches) process.exit(1);
  console.log(`OK: ${matrix.packages.length} packages aligned with package_versions.yaml`);
}

if (require.main === module) main();
