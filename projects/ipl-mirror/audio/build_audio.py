#!/usr/bin/env python3
"""IPL "Ek Ball 49 Lakh" FULL audio: voice_final.wav (49.78s, approved) + SFX har
beat par + mood ke saath badalti music bed. Master ~-15 LUFS.
Sentence starts (s): L1 0.00 L2 3.14 L3 4.30 L4 10.66 L5 11.86 L6 13.00 L7 18.90
L8 24.70 L9 31.32 L10 34.50 L11 37.58 L12 41.88 L13 45.04 end 49.60.
Outputs (is project ke audio/ me): final_audio.wav + mix.ogg + mix.ogg.b64
(voice repo me NAHI jati — workflow build_audio.py chala kar banata hai; local
run sirf verify ke liye hai, parent ke paas voice path alag se diya jayega)."""
import base64, math, os, random, subprocess, sys

SR = 48000
DUR = 1494 / 30.0            # 49.8s
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    "~/workspace/shorts/ipl-ball/voice/voice_final.wav")
random.seed(49)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def load(path, sr=SR):
    """audio file -> float samples (mono) numpy array."""
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


def crowd(dur, vol=0.16, swell=0.6):
    """Bheed ki goonj: filtered noise + random chillahat ke tukde."""
    import numpy as np
    n = int(SR * dur)
    base = noise(dur, vol * 0.7, lp=0.5)
    env = np.minimum(1.0, np.linspace(0, 1, n) / 0.15) * (0.75 + 0.25 * np.sin(np.linspace(0, 9, n)))
    out = base * env
    for _ in range(int(dur * 2.2)):
        st = random.uniform(0, max(0.01, dur - 0.5))
        out = out  # placeholder (cheer bursts alag se lagte hain)
        _ = st
    return (out * (0.6 + swell * 0.4)).astype("float32")


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf) and j > i:
        buf[i:j] += sig[:j - i] * gain


def bed(buf, t0, t1, root, vol, kind="warm"):
    """Halki music bed: root par slow chord arpeggio (mood ke hisaab se)."""
    import numpy as np
    scale = [1.0, 1.25, 1.5, 2.0] if kind != "dark" else [1.0, 1.19, 1.5, 1.78]
    t = t0
    i = 0
    while t < t1:
        f = root * scale[i % len(scale)]
        add(buf, tone(f, 1.15, vol, "tri", attack=0.25), t)
        add(buf, tone(f / 2, 1.15, vol * 0.7, "sine", attack=0.25), t)
        t += 0.92
        i += 1


def main():
    import numpy as np
    mix = np.zeros(N, dtype="float32")
    # ---------------- VOICE ----------------
    v = load(VOICE)
    add(mix, v, 0.0, 1.0)
    # ---------------- MUSIC BED (mood ke saath) ----------------
    bed(mix, 0.0, 10.6, 196, 0.045)            # hook: josh (G major-ish)
    bed(mix, 10.6, 13.0, 220, 0.04)            # ghar: garam
    bed(mix, 13.0, 18.9, 175, 0.038)           # 2008: purana halka
    bed(mix, 18.9, 24.7, 262, 0.05)            # nilami: sunehra uncha
    bed(mix, 24.7, 31.3, 196, 0.045)           # seedhi: chadhta josh
    bed(mix, 31.3, 34.5, 98, 0.05, "dark")     # suspense: gehra andhera
    bed(mix, 34.5, 41.9, 220, 0.045)           # reveal: saaf ujla
    bed(mix, 41.9, 49.8, 247, 0.042)           # punchline + ant: halka khush
    # ---------------- BHEED (stadium segments) ----------------
    add(mix, crowd(4.3, 0.10), 0.0)
    add(mix, crowd(6.4, 0.10), 4.3)
    add(mix, crowd(6.6, 0.085), 24.7)
    add(mix, crowd(3.2, 0.09), 41.9)
    # ---------------- SFX: L1-L3 stadium ----------------
    add(mix, noise(0.5, 0.30), 0.02, 0.8)                       # cheer swell hook
    for k in range(6):
        add(mix, tone(1500 + k * 90, 0.09, 0.10, "square"), 0.15 + k * 0.16)
    add(mix, tone(320, 0.7, 0.12, "sine", slide=500), 3.2)       # L2 point — halka riser
    add(mix, tone(900, 0.35, 0.14, "sine", slide=-500), 4.55)    # ball whoosh (release)
    add(mix, thump(0.12, 0.35, 120), 6.85)                      # ball bounce tap
    add(mix, thump(0.1, 0.2, 200), 7.6)                         # bat/glove soft
    for k in range(9):                                          # counter tik-tik L3
        add(mix, tone(1250, 0.05, 0.075, "square"), 4.5 + k * 0.62)
    add(mix, noise(0.9, 0.34), 10.15, 0.9)                      # cheer burst (counter full)
    add(mix, tone(660, 0.3, 0.12), 10.2)
    add(mix, tone(880, 0.4, 0.12), 10.38)
    # ---------------- SFX: L4-L5 ghar ----------------
    add(mix, tone(1180, 0.07, 0.12, "square"), 10.7)            # gasp tick
    add(mix, tone(520, 0.16, 0.08, "tri"), 11.9)                # kagaz rustle cue
    add(mix, noise(0.25, 0.06, lp=0.8), 11.95)
    add(mix, tone(980, 0.06, 0.08, "square"), 12.3)             # pen tap
    # ---------------- SFX: L6 2008 ----------------
    add(mix, noise(1.8, 0.05, lp=0.9), 13.0)                    # TV static halka
    add(mix, noise(0.7, 0.05, lp=0.9), 16.2)
    add(mix, tone(440, 0.5, 0.05, "sine"), 14.6)                # purani ghanti door
    add(mix, tone(392, 0.6, 0.045, "sine"), 15.3)
    add(mix, thump(0.14, 0.18, 100), 17.5)                      # board thap
    # ---------------- SFX: L7 nilami ----------------
    add(mix, noise(2.6, 0.035, lp=0.4), 18.95)                  # hall murmur
    for k in range(5):                                          # paddle clicks
        add(mix, tone(1500, 0.04, 0.06, "square"), 19.4 + k * 0.85)
    for k in range(7):                                          # boli counter ticks
        add(mix, tone(1050 + k * 60, 0.05, 0.07, "square"), 20.2 + k * 0.55)
    add(mix, thump(0.2, 0.5, 130), 23.05)                       # gavel thap 1
    add(mix, thump(0.2, 0.55, 130), 23.75)                      # gavel thap 2
    add(mix, thump(0.24, 0.6, 120), 24.35)                      # gavel FINAL
    add(mix, tone(784, 0.35, 0.11), 24.42)                      # sold chime
    add(mix, tone(1047, 0.5, 0.11), 24.6)
    # ---------------- SFX: L8 seedhi ----------------
    add(mix, tone(587, 0.22, 0.11), 24.75)                      # match ding
    add(mix, tone(880, 0.22, 0.11), 26.15)                      # over ding
    for k in range(6):                                          # 6 ball ticks
        add(mix, tone(1320, 0.05, 0.08, "square"), 27.4 + k * 0.3)
    for k in range(8):                                          # ball counter tik-tik tez
        add(mix, tone(1250, 0.05, 0.08, "square"), 28.6 + k * 0.24)
    add(mix, tone(1175, 0.35, 0.12), 30.6)                      # final ding
    add(mix, tone(1568, 0.45, 0.1), 30.78)
    add(mix, noise(0.3, 0.05, lp=0.8), 29.2)                    # kagaz par likhna
    # ---------------- SFX: L9 suspense ----------------
    for k in range(4):                                          # ghadi tick-tock
        add(mix, tone(1900 if k % 2 == 0 else 1500, 0.04, 0.09, "square"), 31.5 + k * 0.72)
    add(mix, thump(0.3, 0.22, 65), 32.1)                        # heartbeat 1
    add(mix, thump(0.3, 0.26, 65), 33.15)                       # heartbeat 2
    add(mix, tone(196, 2.6, 0.05, "sine", attack=0.4), 31.4)    # dark drone
    # ---------------- SFX: L10 reveal ----------------
    add(mix, tone(523, 0.25, 0.1), 34.55)                       # reveal chime up
    add(mix, tone(659, 0.25, 0.1), 34.75)
    add(mix, tone(784, 0.4, 0.11), 34.95)
    for k in range(6):                                          # paisa flow dots — soft blips
        add(mix, tone(880 + (k % 3) * 120, 0.06, 0.055, "sine"), 35.4 + k * 0.42)
    add(mix, tone(1047, 0.4, 0.1), 37.3)                        # BCCI counter full ding
    # ---------------- SFX: L11 vasool ----------------
    add(mix, noise(0.3, 0.07, lp=0.8), 37.65)                   # bill kagaz
    add(mix, tone(1400, 0.05, 0.07, "square"), 38.1)            # bill tap
    jingle = [659, 784, 988, 784, 659, 587, 659, 784]           # ishtehaar jingle (funny)
    for k, fq in enumerate(jingle):
        add(mix, tone(fq, 0.16, 0.075, "square"), 39.05 + k * 0.17)
    add(mix, tone(1568, 0.07, 0.09, "square"), 40.75)           # phone buzz-ish beep
    add(mix, tone(1568, 0.07, 0.09, "square"), 40.95)
    add(mix, tone(1180, 0.08, 0.11, "square"), 41.0)            # dost shock tick
    # ---------------- SFX: L12 punchline ----------------
    add(mix, tone(900, 0.35, 0.13, "sine", slide=-500), 42.0)   # ball whoosh callback
    add(mix, thump(0.12, 0.3, 120), 44.1)                       # bounce
    for k in range(5):                                          # jeb ke sikke — coin jingle
        add(mix, tone(1900 + (k % 2) * 300, 0.05, 0.06, "square"), 43.9 + k * 0.09)
    add(mix, tone(740, 0.3, 0.1, "tri"), 44.6)                  # punchline thahraav
    # ---------------- SFX: L13 sawal + ant ----------------
    add(mix, tone(587, 0.25, 0.1), 45.15)
    add(mix, tone(880, 0.3, 0.1), 46.9)
    add(mix, tone(1175, 0.5, 0.1), 48.6)                        # ant chime (tease)
    add(mix, noise(1.0, 0.1), 48.9, 0.7)                        # sunset crowd halka swell
    # ---------------- MASTER: loudnorm 2-pass ----------------
    tmp = os.path.join(HERE, "_mix_raw.wav")
    rawf = os.path.join(HERE, "_mix_raw.f32")
    np.clip(mix, -0.98, 0.98).astype("float32").tofile(rawf)
    ffmpeg("-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", rawf, "-c:a", "pcm_s16le", tmp)
    os.remove(rawf)
    out_wav = os.path.join(HERE, "final_audio.wav")
    stats = subprocess.run(
        ["ffmpeg", "-i", tmp, "-af", "loudnorm=I=-15:TP=-1.0:LRA=11:print_format=json",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    import json, re
    m = re.search(r"\{[^}]*input_i[^}]*\}", stats, re.S)
    if m:
        d = json.loads(m.group(0))
        ln = (f"loudnorm=I=-15:TP=-1.0:LRA=11:measured_I={d['input_i']}:"
              f"measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:"
              f"measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
    else:
        ln = "loudnorm=I=-15:TP=-1.0:LRA=11"
    ffmpeg("-i", tmp, "-af", ln, "-ar", str(SR), "-c:a", "pcm_s16le", out_wav)
    out_ogg = os.path.join(HERE, "mix.ogg")
    ffmpeg("-i", out_wav, "-c:a", "libopus", "-b:a", "96k", out_ogg)
    with open(out_ogg, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode()
    with open(out_ogg + ".b64", "w") as fh:
        fh.write(b64)
    os.remove(tmp)
    print(f"OK final_audio.wav + mix.ogg ({len(b64)} b64 chars), DUR={DUR:.2f}s")


if __name__ == "__main__":
    main()
