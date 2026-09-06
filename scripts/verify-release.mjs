import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const readJson = async (name) => JSON.parse(await readFile(join(root, name), "utf8"));

const [manifest, versions, pkg] = await Promise.all([
  readJson("manifest.json"),
  readJson("versions.json"),
  readJson("package.json"),
]);

const errors = [];
if (/obsidian/i.test(manifest.description || "")) {
  errors.push("市场简介不得包含 Obsidian 字样");
}
if (!/[.!?]$/.test(manifest.description || "")) {
  errors.push("市场简介必须以英文句末标点结尾");
}
if ((manifest.description || "").length > 250) {
  errors.push("市场简介不得超过 250 个字符");
}
const readme = await readFile(join(root, "README.md"), "utf8");
for (const heading of ["Installation", "Usage"]) {
  if (!readme.includes(`## ${heading}`)) errors.push(`README 缺少 ${heading} 说明`);
}
const requiredManifestFields = [
  "id",
  "name",
  "version",
  "minAppVersion",
  "description",
  "author",
  "isDesktopOnly",
];

for (const field of requiredManifestFields) {
  if (manifest[field] === undefined || manifest[field] === "") {
    errors.push(`manifest.json 缺少字段：${field}`);
  }
}

if (!/^[a-z0-9-]+$/.test(manifest.id) || manifest.id.includes("obsidian")) {
  errors.push("manifest.json 的 id 格式不符合社区插件要求");
}

if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  errors.push("manifest.json 的 version 必须是 x.y.z 格式");
}

if (pkg.version !== manifest.version) {
  errors.push("package.json 与 manifest.json 的版本不一致");
}

if (versions[manifest.version] !== manifest.minAppVersion) {
  errors.push("versions.json 未映射当前版本和最低 Obsidian 版本");
}

for (const name of ["README.md", "LICENSE", "main.js", "manifest.json", "styles.css"]) {
  try {
    const info = await stat(join(root, name));
    if (!info.isFile() || info.size === 0) errors.push(`${name} 为空或不是文件`);
  } catch {
    errors.push(`缺少发布文件：${name}`);
  }
}

const syntax = spawnSync(process.execPath, ["--check", join(root, "main.js")], {
  encoding: "utf8",
});
if (syntax.status !== 0) {
  errors.push(`main.js 语法检查失败：${syntax.stderr.trim()}`);
}

if (errors.length > 0) {
  console.error(errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`发布文件检查通过：${manifest.id} ${manifest.version}`);
