# generate_index_ts.py
import os
import re
import sys
from pathlib import Path
from typing import List, Tuple
from collections import defaultdict



def is_valid_tsx_file(filename: str) -> bool:
    return filename.endswith((".tsx", ".ts")) and not filename.startswith("_")


def extract_exported_names(file_path: Path) -> List[Tuple[str, str | None]]:
    results: List[Tuple[str, str | None]] = []

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"读取失败 {file_path}: {e}")
        return results

    # ── 方式1：直接 export const / export function / export type / interface ──
    local_patterns = [
        r"export\s+(?:const|function|type|interface)\s+([A-Z][A-Za-z0-9_]+)\b",
        r"export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[=:]",
        r"export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(",
    ]

    for pat in local_patterns:
        for m in re.finditer(pat, content, re.MULTILINE):
            name = m.group(1)
            if name:
                results.append((name, None))

    # ── 方式2：文件底部统一的 export { A, B, C } （最常见于 shadcn/ui 风格组件） ──
    # 匹配最后一个大的 export { ... } 块（通常在文件末尾）
    export_block_pat = (
        r"export\s*\{\s*([^}]+?)\s*\}\s*;?\s*$"  # 匹配文件末尾的 export { ... };
    )
    block_match = re.search(export_block_pat, content, re.MULTILINE | re.DOTALL)

    if block_match:
        names_part = block_match.group(1)
        for item in names_part.split(","):
            item = item.strip()
            if not item:
                continue
            # 可能有换行、注释等，简单清理
            name = re.sub(r"//.*", "", item).strip()  # 去掉行内注释
            if name and name[0].isupper() and name.isidentifier():  # 基本合法标识符
                # 避免重复添加（如果前面已经有 export const XXX 了）
                if not any(n == name for n, _ in results):
                    results.append((name, None))

    # ── 方式3：re-export from 'xxx' ──（保持原样）
    reexport_pat = r'export\s*\{([^}]+)\}\s*from\s*["\']([^"\']+)["\']'
    for m in re.finditer(reexport_pat, content, re.MULTILINE | re.DOTALL):
        names_part = m.group(1)
        from_path = m.group(2).strip()
        for item in names_part.split(","):
            item = item.strip()
            if not item:
                continue
            if " as " in item:
                _, alias = item.split(" as ", 1)
                name = alias.strip()
            else:
                name = item.strip()
            if name and name[0].isupper():
                results.append((name, from_path))

    # 去重（以防多种方式都匹配到同一个名字）
    unique_results = []
    seen_names = set()
    for name, src in results:
        if name not in seen_names:
            seen_names.add(name)
            unique_results.append((name, src))

    return unique_results


def collect_files(root_dir: Path, exclude_dirs: set) -> List[Path]:
    """使用 os.walk 递归收集所有 .ts/.tsx 文件（Windows 上更可靠）"""
    files = []
    root_str = str(root_dir)
    for dirpath, dirnames, filenames in os.walk(root_str):
        # 原地修改 dirnames 来排除目录
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for filename in filenames:
            if is_valid_tsx_file(filename):
                full_path = Path(dirpath) / filename
                files.append(full_path)
    return files


def main():
    if len(sys.argv) < 2:
        print("用法: python generate_index_ts.py <目录> [--exclude dir1 dir2 ...]")
        sys.exit(1)

    output_dir = Path(sys.argv[1]).resolve()
    if not output_dir.is_dir():
        print(f"不是有效目录：{output_dir}")
        sys.exit(1)

    exclude_dirs = set()
    if "--exclude" in sys.argv:
        idx = sys.argv.index("--exclude")
        exclude_dirs = set(sys.argv[idx + 1 :])

    root_dir = output_dir
    index_path = root_dir / "index.ts"

    all_exports: List[Tuple[str, Path, str | None, str]] = []
    seen: dict[str, Tuple[Path, str]] = {}

    print(f"扫描：{root_dir}")
    print(f"输出：{index_path}\n")

    # 使用 os.walk 收集文件（绕过 glob 对 @ 的问题）
    file_list = collect_files(root_dir, exclude_dirs)

    for file_path in file_list:
        rel_file = file_path.relative_to(root_dir).as_posix()
        exports = extract_exported_names(file_path)

        if exports:
            print(f"{rel_file:50} → {len(exports)} 个导出")
            for name, from_path in exports:
                if name in seen:
                    prev_file, prev_rel = seen[name]
                    print(f"  警告：重复导出名 {name!r}")
                    print(f"      之前：{prev_rel}")
                    print(f"      现在：{rel_file}")
                seen[name] = (file_path, rel_file)
                rel_path_for_sort = (
                    file_path.relative_to(root_dir).with_suffix("").as_posix()
                )
                all_exports.append((name, file_path, from_path, rel_path_for_sort))

    if not all_exports:
        print("没有找到任何导出。可能是文件里没有符合的 export 写法，或正则没匹配到。")
        return

    # 按路径分组： path → list of names

    grouped: defaultdict[str, list[str]] = defaultdict(list)

    for name, _, _, rel_path in all_exports:
        import_path = f"./{rel_path}"
        grouped[import_path].append(name)

    # 排序路径（字母顺序）
    sorted_paths = sorted(grouped.keys())

    lines = [
        "// 此文件由 generate_index_ts.py 自动生成，请勿手动修改",
        "",
    ]

    prev_top_dir = None

    for import_path in sorted_paths:
        names = sorted(grouped[import_path])  # 按名字排序，便于阅读
        export_str = ",\n  ".join(names)

        # 提取一级目录，用于加空行分隔
        rel_path = import_path[2:]  # 去掉 ./
        parts = rel_path.split("/", 1)
        current_top_dir = parts[0] if len(parts) > 1 else ""

        if prev_top_dir is not None and current_top_dir != prev_top_dir:
            lines.append("")  # 不同一级目录加空行

        # 生成合并的 export 块
        lines.append(f"export {{")
        lines.append(f"  {export_str},")
        lines.append(f'}} from "{import_path}";')

        prev_top_dir = current_top_dir

    lines.append("")

    index_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n已生成：{index_path}")
    print(f"总计 {len(all_exports)} 个导出项")


if __name__ == "__main__":
    main()
