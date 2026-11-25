#!/usr/bin/env python3
"""Paani Wala FULL (50.31s) audio: Fenrir final voice + Gullak-style SFX (~65 events).
SFX sirf synthesized (sine/square/tri + filtered noise) — koi external/ripped audio nahi.
(ZERO music bed — voice + SFX only). Master ~-14 LUFS.
Shot samay (s, v4 warp): s01 0.00, s02 1.27, s03 2.53, s04 3.63, s05 4.43, s06 5.37, s07 6.40, s08 7.33, s09 8.13, s10 9.23, s11 10.27, s12 11.40, s13 12.40, s14 13.63, s15 14.90, s16 15.87, s17 16.80, s18 17.77, s19 19.30, s20 20.10, s21 21.20, s22 22.47, s23 23.77, s24 24.63, s25 25.70, s26 26.70, s27 27.80, s28 29.00, s29 29.80, s30 31.17, s31 32.50, s32 33.87, s33 35.37, s34 36.83, s35 38.27, s36 39.27, s37 41.03, s38 41.90, s39 43.00, s40 44.30, s41 45.53, s42 46.90, s43 48.17, s44 49.33.
Outputs: mix.wav + mix.ogg + mix.ogg.b64 (project audio/ me)."""
import base64, math, os, random, subprocess

SR = 48000
DUR = 50.31
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.join(HERE, "voice_full.wav")
random.seed(777)
SFX_COUNT = [0]


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def load(path, sr=SR):
    import numpy as np
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr),
         "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def tone(freq, dur, vol=0.2, kind="sine", slide=0.0, attack=0.005):
    import numpy as np
    t = np.arange(int(SR * dur)) / SR
    f = freq + slide * t
    ph = 2 * math.pi * np.cumsum(f) / SR
    if kind == "sine":
        w = np.sin(ph)
    elif kind == "square":
        w = np.sign(np.sin(ph)) * 0.6
    elif kind == "tri":
        w = 2 * np.abs(2 * (t * freq % 1) - 1) - 1
    else:
        w = np.sin(ph)
    env = np.minimum(1.0, t / max(attack, 1e-4)) * np.exp(-t * 2.2)
    return (w * env * vol).astype("float32")


def noise(dur, vol=0.2, lp=0.3):
    import numpy as np
    n = int(SR * dur)
    w = np.random.randn(n).astype("float32")
    k = max(2, int(lp * 40))
    w = np.convolve(w, np.ones(k, dtype="float32") / k, mode="same")
    env = np.linspace(0, 1, n) ** 0.5 * np.linspace(1, 0.25, n)
    return (w * env * vol).astype("float32")


def thump(dur=0.16, vol=0.5, f0=140):
    import numpy as np
    t = np.arange(int(SR * dur)) / SR
    f = f0 * np.exp(-t * 14)
    w = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t * 16)
    return (w * vol).astype("float32")


def add(buf, sig, at, gain=1.0, count=True):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf) and j > i:
        buf[i:j] += sig[:j - i] * gain
        if count:
            SFX_COUNT[0] += 1


def ding(buf, at, freq=1568, vol=0.13):
    add(buf, tone(freq, 0.34, vol, "sine"), at)
    add(buf, tone(freq * 2.02, 0.2, vol * 0.4, "sine"), at, count=False)


def coins(buf, at, n=5, vol=0.10):
    for k in range(n):
        f = random.uniform(1850, 2650)
        add(buf, tone(f, 0.055, vol, "square"), at + k * random.uniform(0.05, 0.085))


def laugh(buf, at, n=5, vol=0.075, gap=0.13):
    for k in range(n):
        f = 520 - k * 34 + random.uniform(-18, 18)
        add(buf, tone(f, 0.085, vol, "tri", slide=-260), at + k * gap)


def paper(buf, at, dur=0.32, vol=0.085):
    add(buf, noise(dur, vol, lp=0.85), at)


def crowd(buf, at, dur=0.9, vol=0.045):
    add(buf, noise(dur, vol, lp=0.75), at)


def drop(buf, at, vol=0.12):
    """Paani ki boond: uncha tick + neeche splash."""
    add(buf, tone(2400, 0.07, vol, "sine", slide=-1400), at)
    add(buf, noise(0.16, vol * 0.7, lp=0.9), at + 0.08)


def engine(buf, at, dur=0.9, vol=0.06):
    """Tempo engine: halki garaj (voice ke neeche)."""
    add(buf, tone(90, dur, vol, "sine", slide=25), at)
    add(buf, tone(180, dur, vol * 0.5, "sine", slide=40), at, count=False)

def whoosh(buf, at, dur=0.35, vol=0.05):
    """Set-change whoosh: soft noise swell + rising tone (synthesized)."""
    add(buf, noise(dur, vol, lp=0.6), at)
    add(buf, tone(300, dur, vol * 0.6, "sine", slide=600), at, count=False)



def main():
    import numpy as np
    mix = np.zeros(N, dtype="float32")
    v = load(VOICE)
    add(mix, v, 0.0, 1.0, count=False)
    # ---- s01 BOARD chamak ----
    ding(mix, 0.06, 2093, 0.12)
    add(mix, tone(430, 0.09, 0.09, "sine", slide=430), 0.87)
    # ---- s02 garv (saath hazaar) ----
    coins(mix, 1.51, 3, 0.11)                       # cha-ching (Gullak: ek hit)
    # ---- s03 boond ----
    add(mix, tone(2400, 0.07, 0.12, "sine", slide=-1400), 2.68)  # boond tick (ek)
    # ---- s04 smile ----
    # ---- s05 naam (haath hilata) ----
    # ---- s06 jar ghumta ----
    # ---- s07 ghar (darwaza) ----
    add(mix, thump(0.12, 0.3, 150), 6.50)            # darwaza khatkhat
    add(mix, thump(0.14, 0.25, 130), 6.91)           # jar rakha
    # ---- s08 bhor (tempo start + chidiya) ----
    engine(mix, 7.35, 1.0, 0.06)
    # ---- s09 tempo chalti ----
    engine(mix, 8.16, 1.2, 0.055)
    add(mix, thump(0.09, 0.11, 150), 8.44)
    # ---- s10 pachaas ghar ----
    add(mix, thump(0.14, 0.25, 130), 9.35)
    ding(mix, 9.88, 1568, 0.06)
    # ---- s11 bees rupay (note + jar) ----
    paper(mix, 10.36, 0.3, 0.09)                     # note aage
    coins(mix, 10.73, 2, 0.09)
    # ---- s12 teen rupay (boond) ----
    add(mix, tone(2400, 0.07, 0.12, "sine", slide=-1400), 11.54)  # boond tick (ek)
    # ---- s13 diesel ----
    add(mix, noise(0.5, 0.06, lp=0.35), 12.47)       # diesel gurgle
    # ---- s14 ghisai (pochna + khanak) ----
    ding(mix, 14.11, 1245, 0.08)
    # ---- s15 KUL 12 ----
    ding(mix, 15.23, 2093, 0.1)
    # ---- s16 sirf aath (chhoti cha-ching + neeche slide) ----
    coins(mix, 15.98, 2, 0.07)
    # ---- s17 400 tally ----
    for tt in (16.84, 17.02):
        add(mix, tone(1500, 0.04, 0.06, "square"), tt)
    # ---- s18 sawal (tick + pause) ----
    # ---- s19 asli khel (raaz wala slide-up) ----
    whoosh(mix, 19.38, 0.35, 0.05)  # dopahar shift (set-change whoosh)
    # ---- s20 tempo mudti ----
    # ---- s21 wahi jar (spin) ----
    add(mix, tone(900, 0.3, 0.06, "sine", slide=500), 21.26)
    # ---- s22 office reveal ----
    whoosh(mix, 22.56, 0.35, 0.05)  # office reveal (set-change whoosh)
    ding(mix, 22.62, 2093, 0.1)
    # ---- s23 tees rupay ----
    coins(mix, 23.91, 3, 0.1)
    ding(mix, 24.31, 1568, 0.08)
    # ---- s24 koi bhav nahi (pop + thumbs up) ----
    add(mix, tone(430, 0.09, 0.09, "sine", slide=300), 24.77)
    # ---- s25 kal subah (warm) ----
    # ---- s26 puchhna (pop) ----
    # ---- s27 kitna bachta (question tick) ----
    # ---- s28 do sau jar (tempo bhari) ----
    add(mix, thump(0.09, 0.11, 150), 29.07)
    # ---- s29 mudti ----
    engine(mix, 29.78, 0.9, 0.055)
    # ---- s30 REVEAL (4 offices) ----
    ding(mix, 31.26, 2637, 0.13)
    ding(mix, 31.61, 2093, 0.1)
    # ---- s31 guard salute ----
    add(mix, tone(430, 0.09, 0.09, "sine", slide=300), 32.63)
    # ---- s32 aunty bhav-tol (hasi) ----
    laugh(mix, 34.02, 3, 0.06, 0.12)
    # ---- s33 shukriya (warm) ----
    ding(mix, 35.51, 1760, 0.09)
    coins(mix, 35.87, 2, 0.08)
    # ---- s34 sochta (soft) ----
    # ---- s35 150 x 18 ----
    for tt in (38.35, 38.60):
        add(mix, tone(1500, 0.04, 0.07, "square"), tt)
    ding(mix, 38.74, 2093, 0.1)
    # ---- s36 3100 drumbeat ----
    for tt in (39.40, 40.12):
        add(mix, tone(1700, 0.05, 0.08, "square"), tt)
    ding(mix, 40.32, 2637, 0.11)
    # ---- s37 diesel ----
    # ---- s38 toota jar (crack) ----
    add(mix, noise(0.18, 0.16, lp=0.5), 42.06)
    ding(mix, 42.24, 1245, 0.09)
    # ---- s39 2000 ----
    ding(mix, 43.13, 2093, 0.11)
    # ---- s40 60000 CLIMAX (BADI cha-ching) ----
    coins(mix, 44.43, 4, 0.12)
    ding(mix, 44.82, 2637, 0.13)
    # ---- s41 ginta (counting ticks) ----
    for tt in (45.64, 46.03):
        add(mix, tone(1500, 0.04, 0.06, "square"), tt)
    # ---- s42 dukaan TWIST (lambi rukawat ke baad soft ding) ----
    add(mix, tone(300, 0.6, 0.07, "sine", slide=-120), 46.91)
    ding(mix, 47.13, 1760, 0.09)
    # ---- s43 boond ----
    add(mix, tone(2400, 0.07, 0.12, "sine", slide=-1400), 48.28)  # boond tick (ek)
    # ---- s44 loop (cycle ghanti + bheed) ----
    ding(mix, 49.39, 2637, 0.08)
    # ---------------- MASTER: loudnorm 2-pass (-14 LUFS) ----------------
    tmp = os.path.join(HERE, "_mix_raw.wav")
    rawf = os.path.join(HERE, "_mix_raw.f32")
    np.clip(mix, -0.98, 0.98).astype("float32").tofile(rawf)
    ffmpeg("-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", rawf, "-c:a", "pcm_s16le", tmp)
    os.remove(rawf)
    stats = subprocess.run(
        ["ffmpeg", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    import json, re
    mm = re.search(r"\{[^}]*input_i[^}]*\}", stats, re.S)
    if mm:
        d = json.loads(mm.group(0))
        ln = (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={d['input_i']}:"
              f"measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:"
              f"measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
    else:
        ln = "loudnorm=I=-14:TP=-1.0:LRA=11"
    mixed_wav = os.path.join(HERE, "mix.wav")
    ffmpeg("-i", tmp, "-af", ln, "-ar", str(SR), "-c:a", "pcm_s16le", mixed_wav)
    out_ogg = os.path.join(HERE, "mix.ogg")
    ffmpeg("-i", mixed_wav, "-c:a", "libopus", "-b:a", "96k", out_ogg)
    with open(out_ogg, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode()
    with open(out_ogg + ".b64", "w") as fh:
        fh.write(b64)
    os.remove(tmp)
    print(f"OK mix.wav/mix.ogg, SFX events={SFX_COUNT[0]}, density={SFX_COUNT[0] / DUR:.2f}/sec, DUR={DUR:.2f}s")


if __name__ == "__main__":
    main()
