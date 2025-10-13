#!/bin/bash

# Loop through all sub directories in packages zipping the libs in their relative out folder

OUT_DIR="out"
mkdir -p "$OUT_DIR"

for pkgLanguage in packages/*; do
    [ -d "$pkgLanguage" ] || continue  # skip if not a directory
    echo "📦 $pkgLanguage"

    for pkgPlatform in "$pkgLanguage"/*; do
        [ -d "$pkgPlatform" ] || continue
        echo "  └─💻 $pkgPlatform"

        for pkgArchitecture in "$pkgPlatform"/*; do
            [ -d "$pkgArchitecture" ] || continue
            echo "      └─ $pkgArchitecture"

            for pkg in "$pkgArchitecture"/*; do
                [ -d "$pkg" ] || continue
                echo "          └─ $pkg"

                # compute relative path inside 'packages/'
                rel_path="${pkg#packages/}"             # remove leading 'packages/'
                dest_dir="$OUT_DIR/$(dirname "$rel_path")"  # same structure under 'out/'
                mkdir -p "$dest_dir"

                # zip name = folder name (basename)
                zip_name="$(basename "$pkg").zip"
                dest_zip="$dest_dir/$zip_name"

                echo "             → Zipping to: $dest_zip"
                
                7z a "$dest_zip" "$pkg"
            done
        done
    done
done

echo "✅ All packages zipped into '$OUT_DIR/'"