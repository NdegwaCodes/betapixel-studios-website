from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from rembg import new_session, remove

BRAND = Path(__file__).resolve().parents[1] / 'src' / 'assets' / 'brand'
_SHAPE = Image.open(BRAND / 'logo.png').getchannel('A')
GREY = (192, 195, 202)
GREY_ON_LIGHT = (118, 121, 130)
LIGHT_SURFACE = 165
OPACITY = 0.72
SHADOW = 0.5
SIZE = 0.45
MIN_W, MAX_W = 0.15, 0.5
MAX_H = 0.14
COVER = 0.7
MASK_SIDE = 640
_session = None
BG_TOLERANCE = 45


def salient_mask(im: Image.Image) -> np.ndarray:
    global _session
    if _session is None:
        _session = new_session('isnet-general-use')
    small = im.copy()
    small.thumbnail((MASK_SIDE, MASK_SIDE))
    return np.asarray(remove(small, session=_session, only_mask=True).resize(im.size, Image.BILINEAR)) > 128


def _content_mask(im: Image.Image) -> np.ndarray:
    salient = salient_mask(im)
    a = np.asarray(im).astype(np.int16)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    mask = (np.abs(a - bg).max(axis=2) > BG_TOLERANCE) | salient
    r = max(2, min(im.size) // 150)
    mask = ndimage.binary_opening(mask, iterations=r)
    return ndimage.binary_fill_holes(ndimage.binary_closing(mask, iterations=r * 2))


def _place(mask: np.ndarray, lw: int, lh: int, margin: int) -> tuple[int, int]:
    H, W = mask.shape
    ys, xs = np.nonzero(mask)
    if not len(xs) or mask.mean() > 0.97:
        return (W - lw) // 2, H - lh - margin
    cx = (xs.min() + xs.max()) // 2
    integral = np.pad(mask.astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    area = lw * lh
    step = max(1, lh // 6)
    xs_try = sorted({min(max(0, cx - lw // 2 + d), W - lw) for d in range(-W // 3, W // 3 + 1, step)}, key=lambda x: abs(x + lw // 2 - cx))
    best, best_score = None, -1.0
    for y in range(min(ys.max(), H - margin) - lh, -1, -step):
        for x in xs_try:
            c = (integral[y + lh, x + lw] - integral[y, x + lw] - integral[y + lh, x] + integral[y, x]) / area
            if c >= COVER:
                return x, y
            if c > best_score:
                best, best_score = (x, y), c
    return best if best else ((W - lw) // 2, H - lh - margin)


def watermark(im: Image.Image, mask: np.ndarray | None = None) -> Image.Image:
    im = im.convert('RGB')
    W, H = im.size
    if mask is None:
        mask = _content_mask(im)
    xs = np.nonzero(mask.any(axis=0))[0]
    content_w = (xs.max() - xs.min() + 1) if len(xs) else W
    lw = round(min(max(content_w * SIZE, W * MIN_W), W * MAX_W))
    lh = round(_SHAPE.height * lw / _SHAPE.width)
    if lh > H * MAX_H:
        lh = round(H * MAX_H)
        lw = round(_SHAPE.width * lh / _SHAPE.height)
    x, y = _place(mask, lw, lh, max(8, round(min(W, H) * 0.04)))
    shape = _SHAPE.resize((lw, lh), Image.LANCZOS)
    blur = max(1, lh // 45)
    shadow = Image.new('L', im.size, 0)
    shadow.paste(shape.point(lambda a: round(a * SHADOW)), (x + blur // 2, y + blur // 2))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    under = np.asarray(im.crop((x, y, x + lw, y + lh)).convert('L'))[np.asarray(shape) > 128]
    light = under.size and under.mean() > LIGHT_SURFACE
    out = im.copy()
    if not light:
        out.paste(Image.new('RGB', im.size, (20, 24, 40)), (0, 0), shadow)
    out.paste(Image.new('RGB', (lw, lh), GREY_ON_LIGHT if light else GREY), (x, y), shape.point(lambda a: round(a * OPACITY)))
    return out
