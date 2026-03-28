import subprocess
from pathlib import Path


def convert_gif_to_webm(folder: Path, crf: int = 30):
    for gif_file in folder.glob("*.gif"):
        output_file = gif_file.with_suffix(".webm")
        print(f"Converting {gif_file} → {output_file}")
        subprocess.run(
            [
                "ffmpeg",
                "-i",
                str(gif_file),
                "-c:v",
                "libvpx-vp9",
                "-crf",
                str(crf),
                "-b:v",
                "0",
                "-an",
                str(output_file),
            ],
            check=True,
        )


def convert_png_to_webp(folder: Path):
    for png_file in folder.glob("*.png"):
        output_file = png_file.with_suffix(".webp")
        print(f"Converting {png_file} → {output_file}")
        subprocess.run(
            ["magick", "convert", str(png_file), str(output_file)], check=True
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Batch convert GIFs to WebM and PNGs to WebP"
    )
    parser.add_argument("folder", type=Path, help="Folder containing media files")
    parser.add_argument(
        "--crf", type=int, default=30, help="CRF for VP9 encoding (GIF → WebM)"
    )
    args = parser.parse_args()

    folder = args.folder.resolve()

    convert_gif_to_webm(folder, crf=args.crf)
    convert_png_to_webp(folder)
