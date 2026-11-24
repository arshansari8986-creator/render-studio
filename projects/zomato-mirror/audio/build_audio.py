#!/usr/bin/env python3
"""Zomato "₹500 Order Ka Hisaab" FULL audio: voice_slow.wav (60.72s, user-approved
slow version) + FUNNY/prominent SFX har action par (~1.2 event/sec, ZERO whoosh)
+ mood ke saath badalti halki music bed. Master ~-15 LUFS.
Shot samay (s): hook 0.0 | ₹185 board 1.43 | shock 2.40 | Seth hasi 6.50-9.20 |
order ding 9.20 | laddoo 11.50-14.03 | degh 14.03 | dabba pack 15.13 | rider ₹50
16.27 | hafta 18.73 | paisa ₹335 19.90 | kagaz 21.27 | commission kat 23.70 |
TAX stamp 25.17 | sar ghoom 27.83 | dabba ₹25 30.53 | receipt ₹10 31.60 |
mile ₹335 32.83 | khana ₹150 35.23 | BAACHE ₹185 36.30 | kharche 37.63 |
khaali plate 39.87 | Seth haara 42.37-45.90 | phir order 48.10 | taala 50.73 |
bill/fee 53.13-55.93 | khud check 55.93 | ant sawal 58.87-60.73.
Outputs (is project ke audio/ me): final_audio.wav (= voice ki copy, task rule) +
mix.ogg + mix.ogg.b64 (poora mix: voice + SFX + bed)."""
import base64, math, os, random, subprocess, sys

SR = 48000
DUR = 1822 / 30.0            # 60.73s
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    "~/workspace/shorts/zomato-500/voice/voice_slow.wav")
random.seed(185)
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
    """Ghanti/bell: sine + upar wala harmonic, tez chamak."""
    add(buf, tone(freq, 0.34, vol, "sine"), at)
    add(buf, tone(freq * 2.02, 0.2, vol * 0.4, "sine"), at, count=False)


def coins(buf, at, n=5, vol=0.10):
    """Sikkon ki khanak: tez random-pitch chhote chirps."""
    for k in range(n):
        f = random.uniform(1850, 2650)
        add(buf, tone(f, 0.055, vol, "square"), at + k * random.uniform(0.05, 0.085))


def laugh(buf, at, n=5, vol=0.075, gap=0.13):
    """Cartoon hasi: girte pitch ke chhote 'ha' bursts (halki, funny)."""
    for k in range(n):
        f = 520 - k * 34 + random.uniform(-18, 18)
        add(buf, tone(f, 0.085, vol, "tri", slide=-260), at + k * gap)


def paper(buf, at, dur=0.32, vol=0.085):
    add(buf, noise(dur, vol, lp=0.85), at)


def snip(buf, at, vol=0.13):
    """Kainchi/kagaz katna: do tez noise kat + click."""
    add(buf, noise(0.05, vol, lp=0.12), at)
    add(buf, noise(0.05, vol * 0.9, lp=0.12), at + 0.09)
    add(buf, tone(2100, 0.03, vol * 0.6, "square"), at + 0.02, count=False)


def stamp(buf, at, vol=0.5):
    """Badi stamp ki THAP: gehra thump + kagaz dabne ki awaaz."""
    add(buf, thump(0.22, vol, 105), at)
    add(buf, noise(0.07, vol * 0.35, lp=0.5), at, count=False)


def bed(buf, t0, t1, root, vol, kind="warm"):
    import numpy as np
    scale = [1.0, 1.25, 1.5, 2.0] if kind != "dark" else [1.0, 1.19, 1.5, 1.78]
    t = t0
    i = 0
    while t < t1:
        f = root * scale[i % len(scale)]
        add(buf, tone(f, 1.15, vol, "tri", attack=0.25), t, count=False)
        add(buf, tone(f / 2, 1.15, vol * 0.7, "sine", attack=0.25), t, count=False)
        t += 0.92
        i += 1


def main():
    import numpy as np
    mix = np.zeros(N, dtype="float32")
    # ---------------- VOICE ----------------
    v = load(VOICE)
    add(mix, v, 0.0, 1.0, count=False)
    # ---------------- MUSIC BED (mood ke saath badalti) ----------------
    bed(mix, 0.0, 9.2, 220, 0.045)             # hook + khushi: halka khush
    bed(mix, 9.2, 18.7, 196, 0.040)            # roz ka kaam: garam
    bed(mix, 18.7, 21.3, 220, 0.042)           # paisa aaya: ujla
    bed(mix, 21.3, 36.3, 147, 0.050, "dark")   # hisaab/ghaata: bhari
    bed(mix, 36.3, 41.0, 196, 0.045)           # ₹185 reveal: saaf
    bed(mix, 41.0, 47.0, 165, 0.045, "dark")   # Seth wala hissa: gehra
    bed(mix, 47.0, 53.1, 220, 0.042)           # kal phir order: khush callback
    bed(mix, 53.1, 57.5, 196, 0.040)           # khud check: garam
    bed(mix, 57.5, 60.73, 147, 0.040, "dark")  # ant sawal: thahra hua
    # ---------------- SFX: HOOK (z01-z04) ----------------
    ding(mix, 0.05, 1319, 0.13)                                  # plate par chamak
    add(mix, tone(420, 0.09, 0.10, "sine", slide=480), 0.7)      # cartoon pop
    add(mix, thump(0.14, 0.32, 150), 1.46)                       # ₹185 board THAK
    ding(mix, 1.52, 1047, 0.10)
    add(mix, tone(500, 0.18, 0.12, "sine", slide=430), 2.45)     # shock: hairani slide-up
    add(mix, tone(1500, 0.04, 0.08, "square"), 3.52)             # soch tick 1
    add(mix, tone(1150, 0.04, 0.08, "square"), 3.86)             # soch tick 2
    # ---------------- SFX: DHABA KHULA + SETH HASI (z05-z07) ----------------
    ding(mix, 4.75, 1047, 0.10)                                  # subah ki ghanti
    ding(mix, 4.95, 1319, 0.09)
    add(mix, tone(2350, 0.04, 0.07, "square"), 5.6)              # kalchhi khanak
    add(mix, tone(2350, 0.04, 0.06, "square"), 5.95)
    laugh(mix, 6.60, 4, 0.065, 0.14)                             # Seth ki halki hasi
    laugh(mix, 8.00, 6, 0.085, 0.115)                            # hasi close-up: badi
    # ---------------- SFX: ORDER + KHUSHI (z08-z11) ----------------
    ding(mix, 9.24, 1568, 0.14)                                  # phone order DING
    ding(mix, 9.38, 1175, 0.11)                                  # notification dusri
    add(mix, tone(920, 0.05, 0.09, "square"), 9.78)              # accept tap
    add(mix, tone(880, 0.16, 0.10, "sine"), 10.46)               # Mohan khush chime
    add(mix, tone(1175, 0.2, 0.09, "sine"), 10.62)
    ding(mix, 11.56, 1760, 0.13)                                 # laddoo ghanti 1
    ding(mix, 12.28, 2093, 0.11)                                 # laddoo ghanti 2
    add(mix, tone(500, 0.08, 0.09, "sine", slide=380), 12.95)    # khane ki khushi pop
    add(mix, tone(560, 0.08, 0.08, "sine", slide=340), 13.30)
    # ---------------- SFX: KAAM (z12-z15) ----------------
    add(mix, noise(0.5, 0.045, lp=0.9), 14.06)                   # degh ki bhaap hiss
    add(mix, tone(2400, 0.04, 0.08, "square"), 14.45)            # kalchhi khanak
    add(mix, tone(2250, 0.04, 0.07, "square"), 14.85)
    paper(mix, 15.18, 0.3, 0.08)                                 # dabba khula/band
    add(mix, thump(0.12, 0.26, 170), 15.95)                      # dabba band THAK
    ding(mix, 16.32, 1568, 0.12)                                 # bike ghanti tring
    ding(mix, 16.58, 1568, 0.10)                                 # tring phir
    coins(mix, 16.95, 4, 0.10)                                   # rider ko ₹50 sikke
    for k in range(6):                                           # bike engine phatphat (halka)
        add(mix, tone(88, 0.05, 0.055, "square"), 17.60 + k * 0.11)
    # ---------------- SFX: HAFTA + PAISA (z16-z17) ----------------
    paper(mix, 18.78, 0.28, 0.09)                                # calendar page flip
    add(mix, tone(1400, 0.04, 0.08, "square"), 19.05)            # din tick
    add(mix, tone(1400, 0.04, 0.08, "square"), 19.32)
    add(mix, tone(1400, 0.04, 0.08, "square"), 19.58)
    ding(mix, 19.95, 1319, 0.13)                                 # paisa aaya ding
    coins(mix, 20.55, 6, 0.105)                                  # ₹335 khanak
    ding(mix, 20.95, 1047, 0.10)
    # ---------------- SFX: HISAAB KHULA (z18-z19) ----------------
    paper(mix, 21.32, 0.5, 0.095)                                # kagaz khula
    add(mix, tone(1250, 0.04, 0.07, "square"), 22.58)            # pen tap
    add(mix, tone(1250, 0.04, 0.07, "square"), 22.85)
    # ---------------- SFX: KATAUTI (z20-z30) ----------------
    snip(mix, 23.75, 0.13)                                       # commission: kainchi 1
    snip(mix, 24.05, 0.12)                                       # kainchi 2
    add(mix, tone(1250, 0.26, 0.11, "sine", slide=-720), 24.18)  # ulta cha-ching (girta)
    paper(mix, 24.62, 0.3, 0.07)                                 # kata tukda gira
    stamp(mix, 25.22, 0.52)                                      # TAX STAMP: BADI THAP
    stamp(mix, 25.95, 0.30)                                      # chhap pakki dusri thap
    add(mix, tone(460, 0.17, 0.115, "sine", slide=400), 26.62)   # Mohan shock slide-up
    add(mix, tone(300, 1.15, 0.10, "sine", slide=560), 27.88)    # sar ghoom: chakkar ghumav 1
    add(mix, tone(880, 0.5, 0.07, "sine", slide=-480), 28.55, count=False)  # chakkar utaar
    ding(mix, 29.02, 2093, 0.08)                                 # taare ding
    ding(mix, 29.14, 2349, 0.075)
    ding(mix, 29.26, 2637, 0.07)
    stamp(mix, 29.38, 0.34)                                      # tax stamp phir (halki)
    add(mix, thump(0.13, 0.30, 165), 30.58)                      # dabba ₹25: dabba gira THAK
    paper(mix, 30.72, 0.22, 0.07)                                # dabba kagaz
    for k in range(4):                                           # receipt printer tik-tik
        add(mix, tone(1350, 0.035, 0.075, "square"), 31.66 + k * 0.16)
    paper(mix, 32.30, 0.3, 0.08)                                 # receipt nikli
    coins(mix, 32.90, 5, 0.105)                                  # mile ₹335 khanak
    ding(mix, 33.45, 1175, 0.10)
    add(mix, noise(0.45, 0.04, lp=0.95), 34.08)                  # degh ubal halka
    add(mix, tone(2300, 0.04, 0.07, "square"), 34.55)            # kalchhi khanak
    paper(mix, 35.28, 0.4, 0.075)                                # khana ₹150: kagaz par likhai
    add(mix, tone(1250, 0.04, 0.07, "square"), 35.85)
    coins(mix, 36.38, 7, 0.115)                                  # BAACHE ₹185: BADI khanak
    ding(mix, 36.85, 1319, 0.12)                                 # reveal ding
    ding(mix, 37.02, 1568, 0.11)
    # ---------------- SFX: KHARCHE + KHAALI PLATE (z31-z33) ----------------
    add(mix, thump(0.12, 0.24, 150), 37.70)                      # kiraya thak
    add(mix, tone(2500, 0.03, 0.08, "square"), 38.10)            # bijli switch tik
    add(mix, tone(50, 0.22, 0.028, "square"), 38.16, count=False)  # bijli buzz halka
    add(mix, noise(0.24, 0.055, lp=0.6), 38.85)                  # gas phus
    ding(mix, 39.95, 2093, 0.09)                                 # khaali plate khanak
    add(mix, tone(740, 0.3, 0.07, "sine", slide=-260), 40.05, count=False)  # udaas girawat
    # ---------------- SFX: SETH HAARA (z34-z38) ----------------
    add(mix, tone(400, 0.4, 0.07, "sine", slide=-150), 41.08)    # Mohan ki thakan slide-down
    add(mix, tone(360, 0.38, 0.065, "sine", slide=-140), 42.45)  # Seth haara slide-down
    add(mix, thump(0.1, 0.16, 130), 43.70)                       # Seth ke kadam 1
    add(mix, thump(0.1, 0.15, 130), 44.02)                       # kadam 2
    add(mix, thump(0.1, 0.15, 130), 44.34)                       # kadam 3
    add(mix, tone(430, 0.09, 0.09, "sine", slide=420), 44.85)    # Seth bola: pop
    add(mix, tone(523, 0.35, 0.07, "sine"), 45.98)               # Mohan shaant saans-tone
    # ---------------- SFX: KAL PHIR + TAALA (z39-z42) ----------------
    ding(mix, 47.12, 1568, 0.06)                                 # door bike ghanti
    for k in range(4):                                           # door engine halka
        add(mix, tone(84, 0.05, 0.035, "square"), 47.45 + k * 0.12)
    ding(mix, 48.15, 1568, 0.135)                                # PHIR order ding (callback)
    ding(mix, 48.29, 1175, 0.11)
    paper(mix, 49.30, 0.3, 0.08)                                 # pack kagaz
    add(mix, thump(0.12, 0.25, 170), 49.95)                      # dabba band
    add(mix, tone(2450, 0.035, 0.11, "square"), 50.80)           # taala KHATAK 1
    add(mix, thump(0.14, 0.30, 180), 50.86)                      # taala band thak
    add(mix, tone(2200, 0.03, 0.08, "square"), 51.30)            # chaabi tik
    add(mix, tone(2200, 0.03, 0.07, "square"), 51.55)
    # ---------------- SFX: KHUD CHECK (z43-z47) ----------------
    add(mix, tone(1050, 0.05, 0.08, "square"), 52.00)            # app blip 1
    add(mix, tone(1250, 0.05, 0.08, "square"), 52.35)            # app blip 2
    add(mix, tone(1500, 0.05, 0.08, "square"), 52.70)            # app blip 3
    paper(mix, 53.20, 0.35, 0.08)                                # bill kagaz/screen
    add(mix, tone(1500, 0.04, 0.085, "square"), 54.55)           # fee suspense tick 1
    add(mix, tone(1500, 0.04, 0.085, "square"), 54.95)           # tick 2
    add(mix, tone(220, 0.85, 0.05, "sine", attack=0.2), 55.05)   # fee sting gehra
    add(mix, tone(233, 0.85, 0.045, "sine", attack=0.2), 55.05, count=False)
    add(mix, tone(905, 0.22, 0.09, "sine", slide=-300), 55.55)   # fee zoom ulta ding
    add(mix, tone(410, 0.09, 0.105, "sine", slide=490), 56.00)   # point pop (khud check karo)
    ding(mix, 57.55, 1047, 0.09)                                 # shaant ding
    # ---------------- SFX: ANT SAWAL (z48) ----------------
    add(mix, tone(196, 1.3, 0.06, "sine", attack=0.3), 58.95)    # suspense sting gehra 1
    add(mix, tone(185, 1.3, 0.05, "sine", attack=0.3), 58.95, count=False)  # sting 2 (tanav)
    coins(mix, 60.15, 3, 0.07)                                   # ant halki khanak (callback)
    # ---------------- MASTER: loudnorm 2-pass ----------------
    tmp = os.path.join(HERE, "_mix_raw.wav")
    rawf = os.path.join(HERE, "_mix_raw.f32")
    np.clip(mix, -0.98, 0.98).astype("float32").tofile(rawf)
    ffmpeg("-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", rawf, "-c:a", "pcm_s16le", tmp)
    os.remove(rawf)
    stats = subprocess.run(
        ["ffmpeg", "-i", tmp, "-af", "loudnorm=I=-15:TP=-1.0:LRA=11:print_format=json",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    import json, re
    mm = re.search(r"\{[^}]*input_i[^}]*\}", stats, re.S)
    if mm:
        d = json.loads(mm.group(0))
        ln = (f"loudnorm=I=-15:TP=-1.0:LRA=11:measured_I={d['input_i']}:"
              f"measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:"
              f"measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
    else:
        ln = "loudnorm=I=-15:TP=-1.0:LRA=11"
    mixed_wav = os.path.join(HERE, "_mixed.wav")
    ffmpeg("-i", tmp, "-af", ln, "-ar", str(SR), "-c:a", "pcm_s16le", mixed_wav)
    out_ogg = os.path.join(HERE, "mix.ogg")
    ffmpeg("-i", mixed_wav, "-c:a", "libopus", "-b:a", "96k", out_ogg)
    with open(out_ogg, "rb") as fh:
        b64 = base64.b64encode(fh.read()).decode()
    with open(out_ogg + ".b64", "w") as fh:
        fh.write(b64)
    os.remove(tmp)
    os.remove(mixed_wav)
    # final_audio.wav = voice ki seedhi copy (task rule)
    ffmpeg("-i", VOICE, "-c:a", "pcm_s16le", os.path.join(HERE, "final_audio.wav"))
    print(f"OK mix.ogg ({len(b64)} b64 chars) + final_audio.wav (voice copy), "
          f"SFX events={SFX_COUNT[0]}, density={SFX_COUNT[0] / DUR:.2f}/sec, DUR={DUR:.2f}s")


if __name__ == "__main__":
    main()
