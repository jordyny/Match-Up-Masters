"""
Lyric similarity utility.

Computes percentage of shared words between two lyric lines.
Definition: percentage = (|intersection(words1, words2)| / max(len(words1), len(words2))) * 100

This mirrors the frontend logic used in RiffOffPage.
"""
from __future__ import annotations

import re
from typing import Iterable, Set


_WORD_RE = re.compile(r"[A-Za-z0-9']+")


def _tokenize(text: str) -> Iterable[str]:
    if not text:
        return []
    return [m.group(0).lower() for m in _WORD_RE.finditer(text)]


def compute_similarity_percentage(line1: str, line2: str) -> float:
    """
    Compute similarity between two strings as a percentage of shared words.

    - Tokenize by alphanumerics/apostrophes
    - Case-insensitive
    - percentage = intersection_count / max(len(words1), len(words2)) * 100
    """
    words1 = list(_tokenize(line1))
    words2 = list(_tokenize(line2))

    if not words1 and not words2:
        return 100.0
    if not words1 or not words2:
        return 0.0

    set1: Set[str] = set(words1)
    set2: Set[str] = set(words2)

    intersection_size = len(set1.intersection(set2))
    denom = max(len(set1), len(set2))
    if denom == 0:
        return 0.0
    return (intersection_size / denom) * 100.0


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python lyric_similarity.py <line1> <line2>")
        sys.exit(1)
    l1 = sys.argv[1]
    l2 = sys.argv[2]
    pct = compute_similarity_percentage(l1, l2)
    print(f"Similarity: {pct:.2f}%")


