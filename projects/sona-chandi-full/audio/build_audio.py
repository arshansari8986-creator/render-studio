#!/usr/bin/env python3
"""Sona-Chandi FULL (61.62s) audio: Fenrir final2 voice (full) + comedy SFX har action
par (ZERO music bed — user pattern: voice + SFX only). Master ~-14 LUFS.
Shot samay (s): s01 board 0.0 | s02 gaddi 1.10 | s03 crash 2.37 | s04 udaas 3.90
| s05 naya din 5.00 | s06 tick-up 5.90 | s07 bheed 7.00 | s08 board chamak 7.93
| s09 tarazu 9.30 | s10 exchange 10.30 | s11 thaali 11.30 | s12 dhakka 12.10
| s13 garv 13.30 | s14 dibba band 14.70 | s15 nikalta 15.70 | s16 dost 16.70
| s17 hasi 17.85 | s18 akad 18.40 | s19 mudta 20.52 | s20 ghar 21.36 | s21 almari
22.48 | s22 sapna 23.00 | s23 dugna 24.38 | s24 din badle 25.50 | s25 board
26.66 | s26 3.4L 27.82 | s27 2.6L 29.10 | s28 2L/subah 29.86 | s29 1.6L CRASH
31.48 | s30 frozen 32.40 | s31 guzarta 33.22 | s32 board dekhta 34.60 | s33
nikal jata 35.80 | s34 dibba uthaya 36.82 | s35 khaali dukaan 37.68 | s36 taula
39.68 | s37 calculator 40.42 | s38 shaant 41.82 | s39 quote 42.66 | s40 dibba
44.38 | s41 board ka number 45.50 | s42 realisation 48.00 | s43 samajh aaya
50.50 | s44 hold 53.50 | s45 thesis 56.20 | s46 loop walk 58.80 | s47 loop wide 60.00.
Outputs: mix.wav + mix.ogg + mix.ogg.b64 (project audio/ me)."""
import base64, math, os, random, subprocess

SR = 48000
DUR = 61.62
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


def scratch(buf, at):
    """Record-scratch: band hota hua record — noise kat + girta square."""
    add(buf, noise(0.24, 0.13, lp=0.18), at)
    add(buf, tone(290, 0.24, 0.09, "square", slide=-620), at)


def crowd(buf, at, dur=0.9, vol=0.045):
    """Bheed ka halka shor (voice ke neeche)."""
    add(buf, noise(dur, vol, lp=0.75), at)


def main():
    import numpy as np
    mix = np.zeros(N, dtype="float32")
    v = load(VOICE)
    add(mix, v, 0.0, 1.0, count=False)
    # ---- s01 BOARD chamak ----
    ding(mix, 0.06, 2093, 0.12)
    ding(mix, 0.52, 2637, 0.09)
    add(mix, tone(430, 0.09, 0.09, "sine", slide=430), 0.95)
    # ---- s02 gaddi (garv) ----
    paper(mix, 1.22, 0.3, 0.09)
    coins(mix, 1.66, 4, 0.10)                       # cha-ching
    ding(mix, 2.12, 1568, 0.07)
    # ---- s03 CRASH ----
    scratch(mix, 2.38)
    add(mix, thump(0.2, 0.5, 110), 2.46)            # DHAMM board palta
    add(mix, tone(500, 0.2, 0.1, "sine", slide=430), 3.15)  # hairani slide-up
    add(mix, tone(1500, 0.04, 0.07, "square"), 3.62)
    # ---- s04 udaas dibba ----
    ding(mix, 4.15, 1760, 0.07)                     # halke dibbe ki khanak
    add(mix, noise(0.3, 0.04, lp=0.6), 4.52)
    # ---- s05 naya din ----
    add(mix, tone(2350, 0.12, 0.05, "sine", slide=500), 5.08)   # chidiya 1
    add(mix, tone(2500, 0.1, 0.045, "sine", slide=450), 5.42)   # chidiya 2
    ding(mix, 5.58, 1568, 0.08)                     # cycle ghanti
    # ---- s06 board tick-up ----
    for tt in (6.18, 6.45, 6.73):
        add(mix, tone(1500, 0.04, 0.07, "square"), tt)
    ding(mix, 6.92, 2093, 0.11)                     # RECORD chamak
    # ---- s07 bheed badhti ----
    crowd(mix, 7.05, 0.95, 0.05)
    add(mix, thump(0.09, 0.12, 150), 7.3)
    add(mix, thump(0.09, 0.11, 150), 7.56)
    # ---- s08 board chamak + tarazu door se ----
    crowd(mix, 8.55, 0.85, 0.038)
    ding(mix, 7.98, 2093, 0.13)
    ding(mix, 8.5, 2637, 0.08)
    ding(mix, 9.02, 1245, 0.07)
    # ---- s09 tarazu ----
    ding(mix, 9.45, 1245, 0.09)                     # pan ki khanak
    coins(mix, 9.85, 3, 0.08)                       # chandi ke tukde
    add(mix, tone(300, 0.25, 0.05, "sine", slide=-60), 10.08)   # beam creak
    # ---- s10 exchange ----
    crowd(mix, 10.05, 0.85, 0.035)
    paper(mix, 10.4, 0.3, 0.09)                     # note aage badha
    ding(mix, 10.95, 1568, 0.09)                    # dibba counter par
    coins(mix, 11.15, 2, 0.06)
    # ---- s11 thaali bartan ----
    crowd(mix, 11.55, 0.8, 0.035)
    ding(mix, 11.5, 1976, 0.08)
    ding(mix, 11.68, 2217, 0.07)
    ding(mix, 11.88, 1760, 0.08)
    # ---- s12 DHAKKA comedy ----
    add(mix, thump(0.09, 0.12, 150), 12.2)
    add(mix, thump(0.09, 0.12, 150), 12.45)
    add(mix, tone(170, 0.28, 0.15, "sine", slide=520), 12.76)   # BOING
    add(mix, thump(0.16, 0.32, 130), 12.78)                     # dhakka thud
    add(mix, noise(0.25, 0.05, lp=0.6), 12.86)                  # dust
    laugh(mix, 13.06, 3, 0.05, 0.12)                            # peeche wala hasta
    # ---- s13 garv gaddi ----
    crowd(mix, 13.0, 0.85, 0.032)
    paper(mix, 13.5, 0.3, 0.09)
    coins(mix, 13.95, 5, 0.11)                      # BADI cha-ching
    add(mix, tone(520, 0.08, 0.08, "sine", slide=360), 14.42)
    # ---- s14 dibba BAND ----
    add(mix, thump(0.2, 0.5, 130), 15.2)            # DHAK!
    add(mix, noise(0.07, 0.16, lp=0.5), 15.2, count=False)
    ding(mix, 15.52, 1568, 0.06)
    # ---- s15 nikalta ----
    crowd(mix, 15.75, 0.85, 0.04)
    for tt in (15.88, 16.14, 16.4):
        add(mix, thump(0.09, 0.11, 150), tt)
    # ---- s16 dost pakad ----
    add(mix, noise(0.16, 0.07, lp=0.5), 16.78)      # kapda pakad
    add(mix, tone(430, 0.09, 0.09, "sine", slide=300), 17.04)   # pakad pop
    add(mix, tone(1500, 0.04, 0.06, "square"), 17.32)           # hairani tick (cliffhanger)
    # ---- s17 hasi ----
    laugh(mix, 17.95, 5, 0.075, 0.13)
    # ---- s18 akad '5 lakh jayegi' ----
    ding(mix, 18.9, 1568, 0.09)
    add(mix, tone(520, 0.3, 0.08, "sine", slide=360), 19.3)
    coins(mix, 19.9, 4, 0.1)
    # ---- s19 mudta ----
    paper(mix, 20.6, 0.2, 0.07)
    add(mix, thump(0.09, 0.11, 150), 20.9)
    # ---- s20 ghar ki taraf kadam ----
    for tt in (21.6, 21.9, 22.2):
        add(mix, thump(0.09, 0.11, 150), tt)
    # ---- s21 almari band ----
    paper(mix, 22.6, 0.25, 0.08)
    add(mix, thump(0.2, 0.5, 130), 22.95)           # darwaza DHAK
    add(mix, tone(2000, 0.05, 0.08, "square"), 23.05)  # taala click
    # ---- s22 sapna ----
    ding(mix, 23.7, 1760, 0.07)
    add(mix, tone(520, 0.3, 0.06, "sine", slide=300), 24.2)
    # ---- s23 dugna (dream glow) ----
    coins(mix, 24.9, 4, 0.09)
    ding(mix, 25.2, 2093, 0.11)
    # ---- s24 din badal gaye (neeche slide) ----
    add(mix, tone(400, 0.5, 0.1, "sine", slide=-260), 25.9)
    # ---- s25 board ----
    ding(mix, 27.0, 1245, 0.08)
    # ---- s26 tick-DOWN 3.4L ----
    for tt, ff in ((28.0, 1200), (28.3, 1000), (28.6, 800)):
        add(mix, tone(ff, 0.04, 0.07, "square"), tt)
    add(mix, thump(0.12, 0.2, 130), 28.85)
    # ---- s27 tick-DOWN 2.6L ----
    for tt, ff in ((29.2, 1000), (29.5, 800)):
        add(mix, tone(ff, 0.04, 0.07, "square"), tt)
    add(mix, thump(0.12, 0.2, 130), 29.8)
    # ---- s28 2L + subah chidiya ----
    add(mix, tone(900, 0.04, 0.07, "square"), 30.1)
    add(mix, tone(700, 0.04, 0.07, "square"), 30.4)  # v3 I1: s28 2-step descending tick (900->700)
    add(mix, tone(2350, 0.12, 0.05, "sine", slide=500), 30.5)
    # ---- s29 1.6L CRASH (s03 echo) ----
    scratch(mix, 31.1)
    add(mix, thump(0.2, 0.5, 110), 31.2)
    add(mix, tone(500, 0.2, 0.1, "sine", slide=430), 31.8)
    # ---- s30 frozen (lagbhag khaamosh) ----
    add(mix, tone(1500, 0.04, 0.05, "square"), 32.6)
    # ---- s31 guzarta kadam ----
    for tt in (33.6, 33.9, 34.2):
        add(mix, thump(0.09, 0.11, 150), tt)
    # ---- s32 board dekhta ----
    ding(mix, 34.9, 1568, 0.06)
    # ---- s33 nikal jata ----
    for tt in (36.0, 36.3):
        add(mix, thump(0.09, 0.11, 150), tt)
    # ---- s34 dibba uthaya ----
    paper(mix, 37.0, 0.25, 0.08)
    ding(mix, 37.3, 1568, 0.07)
    # ---- s35 khaali dukaan (echo) ----
    ding(mix, 38.4, 1245, 0.05)
    add(mix, noise(0.9, 0.03, lp=0.4), 38.6)
    # ---- s36 taula ----
    ding(mix, 39.4, 1245, 0.09)
    add(mix, tone(300, 0.25, 0.05, "sine", slide=-60), 39.8)
    coins(mix, 40.1, 3, 0.08)
    # ---- s37 calculator keys ----
    for tt in (40.6, 40.8, 41.0, 41.2):
        add(mix, tone(1500, 0.04, 0.06, "square"), tt)
    ding(mix, 41.5, 1760, 0.07)
    # ---- s38 shaant ----
    add(mix, tone(300, 0.4, 0.05, "sine", slide=60), 42.0)
    # ---- s39 quote ₹3,80,000 (board flip) ----
    add(mix, noise(0.25, 0.08, lp=0.5), 42.75)
    ding(mix, 42.95, 2093, 0.13)
    ding(mix, 43.4, 1568, 0.08)
    # ---- s40 dibba chamak ----
    ding(mix, 44.2, 1760, 0.09)
    add(mix, noise(0.3, 0.04, lp=0.6), 44.7)
    # ---- s41 board ka number (neeche slide) ----
    add(mix, tone(400, 0.5, 0.08, "sine", slide=-200), 45.7)
    add(mix, tone(1200, 0.04, 0.05, "square"), 46.5)
    add(mix, tone(1200, 0.04, 0.05, "square"), 47.5)
    # ---- s42 realisation ----
    ding(mix, 48.3, 1568, 0.06)
    add(mix, tone(430, 0.3, 0.06, "sine", slide=300), 49.5)
    # ---- s43 samajh aaya ----
    ding(mix, 51.3, 1760, 0.07)
    ding(mix, 52.8, 1568, 0.06)
    # ---- s44 hold (hawa) ----
    add(mix, noise(0.9, 0.025, lp=0.4), 54.0)
    add(mix, tone(1500, 0.04, 0.05, "square"), 55.5)
    # ---- s45 thesis (do chime: board + dibba) ----
    ding(mix, 56.4, 2093, 0.11)
    ding(mix, 57.5, 1760, 0.1)
    # ---- s46 loop walk ----
    for tt in (59.0, 59.3, 59.6):
        add(mix, thump(0.09, 0.11, 150), tt)
    # ---- s47 loop wide ----
    ding(mix, 60.3, 2637, 0.08)                     # cycle ghanti
    crowd(mix, 60.5, 0.9, 0.04)
    ding(mix, 61.2, 1568, 0.06)
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
