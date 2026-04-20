import { Project, SourceFile } from "ts-morph";
import path from "node:path";
import fs from "node:fs";

type ExportItem = {
    name: string;
    isDefault: boolean;
    importPath: string;
    isType: boolean;
};

type BarrelViolation = {
    filePath: string;
    line: number;
    moduleSpecifier: string;
};

const VALID_EXT = [".ts", ".tsx"];
const ROOT_BARREL_SPECIFIERS = new Set(["@/components", "@/components/index"]);

function isValidFile(file: string) {
    return (
        VALID_EXT.includes(path.extname(file)) &&
        !path.basename(file).startsWith("_") &&
        !file.endsWith("index.ts")
    );
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

        let isType = false;
        const decls = sym.getDeclarations();
        if (decls.length > 0) {
            isType = decls.every((d) => {
                const kind = d.getKindName();
                return kind === "TypeAliasDeclaration" || kind === "InterfaceDeclaration";
            });
        }

        exports.push({
            name,
            isDefault: false,
            importPath: "",
            isType,
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
                isType: false,
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
                    isType: spec.isTypeOnly(),
                });
            }
        }
    }

    return exports;
}

function findRootBarrelViolations(filePath: string, sourceFile: SourceFile): BarrelViolation[] {
    const violations: BarrelViolation[] = [];

    for (const decl of sourceFile.getImportDeclarations()) {
        const moduleSpecifier = decl.getModuleSpecifierValue();
        if (!ROOT_BARREL_SPECIFIERS.has(moduleSpecifier)) continue;

        violations.push({
            filePath,
            line: decl.getStartLineNumber(),
            moduleSpecifier,
        });
    }

    for (const decl of sourceFile.getExportDeclarations()) {
        const moduleSpecifier = decl.getModuleSpecifierValue();
        if (!moduleSpecifier || !ROOT_BARREL_SPECIFIERS.has(moduleSpecifier)) continue;

        violations.push({
            filePath,
            line: decl.getStartLineNumber(),
            moduleSpecifier,
        });
    }

    return violations;
}

function main() {
    const [, , rootArg, subDir, ...rest] = process.argv;

    if (!rootArg || !subDir) {
        console.log(
            "用法: tsx scripts/mkindex.ts <root> <subDir> [--exclude a b] [--allow-root-barrel-import]"
        );
        process.exit(1);
    }

    const root = path.resolve(rootArg);
    const target = path.join(root, subDir);

    const exclude = new Set<string>();
    let allowRootBarrelImport = false;

    for (let i = 0; i < rest.length; i++) {
        const arg = rest[i];

        if (arg === "--allow-root-barrel-import") {
            allowRootBarrelImport = true;
            continue;
        }

        if (arg === "--exclude") {
            while (i + 1 < rest.length && !rest[i + 1].startsWith("--")) {
                exclude.add(rest[i + 1]);
                i++;
            }
        }
    }

    const project = new Project({
        tsConfigFilePath: "./tsconfig.json",
        skipAddingFilesFromTsConfig: true,
    });

    const files = walk(target, exclude as Set<string>);

    console.log("扫描:", target);

    const all: ExportItem[] = [];
    const violations: BarrelViolation[] = [];

    for (const file of files) {
        const sf = project.addSourceFileAtPath(file);

        const rel = path
            .relative(target, file)
            .replace(/\.(ts|tsx)$/, "")
            .replace(/\\/g, "/");

        if (!allowRootBarrelImport) {
            violations.push(...findRootBarrelViolations(file, sf));
        }

        const exports = extractExports(file, sf);

        for (const e of exports) {
            const importPath = e.importPath || `./${rel}`;

            all.push({
                ...e,
                importPath,
            });
        }
    }

    if (violations.length > 0) {
        console.error(
            "\n检测到组件内部引用根 barrel（@/components），这会导致循环依赖与运行时 undefined：\n"
        );

        for (const violation of violations) {
            const relPath = path.relative(root, violation.filePath).replace(/\\/g, "/");
            console.error(`- ${relPath}:${violation.line} -> ${violation.moduleSpecifier}`);
        }

        console.error(
            "\n请改为精确子路径导入，例如 '@/components/@shadcn-ui' 或 '@/components/@prime-light/...'."
        );
        console.error("如需临时跳过校验，可增加 --allow-root-barrel-import 参数。\n");
        process.exit(1);
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
            .map((e) => {
                let prefix = "";
                if (e.isType) prefix = "type ";
                return e.isDefault ? `  default as ${e.name}` : `  ${prefix}${e.name}`;
            });

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
