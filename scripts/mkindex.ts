import { Project, SourceFile } from "ts-morph";
import path from "node:path";
import fs from "node:fs";

type ExportItem = {
    name: string;
    isDefault: boolean;
    importPath: string;
};

const VALID_EXT = [".ts", ".tsx"];

function isValidFile(file: string) {
    return VALID_EXT.includes(path.extname(file)) && !path.basename(file).startsWith("_") && !file.endsWith("index.ts");
}

function walk(dir: string, exclude = new Set<string>()): string[] {
    const res: string[] = [];

    for (const entry of fs.readdirSync(dir)) {
        if (exclude.has(entry)) continue;

        const full = path.join(dir, entry);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            res.push(...walk(full, exclude));
        } else if (isValidFile(full)) {
            res.push(full);
        }
    }

    return res;
}

function extractExports(filePath: string, sourceFile: SourceFile): ExportItem[] {
    const exports: ExportItem[] = [];

    // ── 1. named exports ──
    const named = sourceFile.getExportSymbols();
    for (const sym of named) {
        const name = sym.getName();

        if (name === "default") continue;
        if (!/^[A-Z]/.test(name)) continue;

        exports.push({
            name,
            isDefault: false,
            importPath: "",
        });
    }

    // ── 2. default export ──
    const defaultExport = sourceFile.getDefaultExportSymbol();

    if (defaultExport) {
        let name = defaultExport.getName();

        const decl = defaultExport.getDeclarations()[0];

        // 🔥 关键：优先从 declaration 拿真实名字
        if (decl) {
            // export default TextType
            if (decl.getKindName() === "Identifier") {
                name = decl.getText();
            }

            // export default function TextType() {}
            if ("getName" in decl && (decl.getName as () => string)()) {
                name = (decl.getName as () => string)();
            }

            // export default const（间接）
            if (decl.getKindName() === "VariableDeclaration") {
                name = decl.getText();
            }
        }

        // 🛟 最终兜底：文件名
        if (!name || name === "default") {
            name = path.basename(filePath).replace(/\.(ts|tsx)$/, "");
        }

        // 👉 建议这里别卡死大写（真实项目会炸）
        if (name) {
            exports.push({
                name,
                isDefault: true,
                importPath: "",
            });
        }
    }

    // ── 3. re-export (export { A } from "./x") ──
    const exportDecls = sourceFile.getExportDeclarations();

    for (const decl of exportDecls) {
        const moduleSpecifier = decl.getModuleSpecifierValue();
        if (!moduleSpecifier) continue;

        for (const spec of decl.getNamedExports()) {
            const name = spec.getNameNode().getText();
            const alias = spec.getAliasNode()?.getText() ?? name;

            if (/^[A-Z]/.test(alias)) {
                exports.push({
                    name: alias,
                    isDefault: false,
                    importPath: moduleSpecifier,
                });
            }
        }
    }

    return exports;
}

function main() {
    const [, , rootArg, subDir, ...rest] = process.argv;

    if (!rootArg || !subDir) {
        console.log("用法: tsx generate-index.ts <root> <subDir> [--exclude a b]");
        process.exit(1);
    }

    const root = path.resolve(rootArg);
    const target = path.join(root, subDir);

    const excludeIdx = rest.indexOf("--exclude");
    const exclude = excludeIdx !== -1 ? new Set(rest.slice(excludeIdx + 1)) : new Set();

    const project = new Project({
        tsConfigFilePath: "./tsconfig.json",
        skipAddingFilesFromTsConfig: true,
    });

    const files = walk(target, exclude as Set<string>);

    console.log("扫描:", target);

    const all: ExportItem[] = [];

    for (const file of files) {
        const sf = project.addSourceFileAtPath(file);

        const rel = path
            .relative(target, file)
            .replace(/\.(ts|tsx)$/, "")
            .replace(/\\/g, "/");

        const exports = extractExports(file, sf);

        for (const e of exports) {
            const importPath = e.importPath || `./${rel}`;

            all.push({
                ...e,
                importPath,
            });
        }
    }

    if (!all.length) {
        console.log("没有导出");
        return;
    }

    // ── 分组 ──
    const grouped = new Map<string, ExportItem[]>();

    for (const item of all) {
        if (!grouped.has(item.importPath)) {
            grouped.set(item.importPath, []);
        }
        grouped.get(item.importPath)!.push(item);
    }

    // ── 输出 ──
    const lines: string[] = ["// AUTO-GENERATED FILE. DO NOT EDIT", ""];

    const sortedPaths = [...grouped.keys()].sort();

    let prevTop = "";

    for (const importPath of sortedPaths) {
        const items = grouped.get(importPath)!;

        const currentTop = importPath.split("/")[1] ?? "";

        if (prevTop && currentTop !== prevTop) {
            lines.push("");
        }

        lines.push("export {");

        const formatted = items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((e) => (e.isDefault ? `  default as ${e.name}` : `  ${e.name}`));

        lines.push(formatted.join(",\n") + ",");
        lines.push(`} from "${importPath}";`);

        prevTop = currentTop;
    }

    lines.push("");

    const outFile = path.join(target, "index.ts");
    fs.writeFileSync(outFile, lines.join("\n"), "utf-8");

    console.log("生成:", outFile);
    console.log("导出数量:", all.length);
}

main();
