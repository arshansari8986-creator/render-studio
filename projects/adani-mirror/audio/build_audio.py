#!/usr/bin/env python3
"""Adani FULL audio: voice_fast.wav (58.95s) + SFX har beat par + halki tense bed.
Sample wala pattern (build_audio_sample.py) hi aage badhaya gaya hai.
Outputs: final_audio.wav + mix.ogg + mix.ogg.b64 (GitHub render ke liye).
Master: mix ke baad loudnorm-measure karke ~-15 LUFS par gain + soft limit."""
import numpy as np
from scipy.io import wavfile
import subprocess, base64, os, json, re

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = os.path.expanduser('~/workspace/shorts/adani-crash/voice/voice_fast.wav')
DUR = 1769 / 30.0  # 58.9667s = TOTAL frames @30fps

sr, data = wavfile.read(VOICE)
assert sr == 48000 and data.dtype == np.int16, (sr, data.dtype)
v = data.astype(np.float32) / 32768.0
n = int(DUR * sr)
mix = np.zeros(n, dtype=np.float32)
mix[:min(n, len(v))] = v[:min(n, len(v))]
rng = np.random.default_rng(23)

def add(sig, t0, gain):
    i = int(t0 * sr)
    j = min(n, i + len(sig))
    if j > i:
        mix[i:j] += sig[:j - i] * gain

def tone(freq, dur, kind='sine', decay=0.0):
    t = np.arange(int(dur * sr)) / sr
    if kind == 'square':
        s = np.sign(np.sin(2 * np.pi * freq * t)) * 0.6 + 0.4 * np.sin(2 * np.pi * freq * t)
    elif kind == 'saw':
        s = 2 * (t * freq - np.floor(t * freq + 0.5))
    else:
        s = np.sin(2 * np.pi * freq * t)
    env = np.minimum(1, np.minimum(t / 0.012, (dur - t) / 0.012))
    if decay > 0:
        env = env * np.exp(-t * decay)
    return (s * np.maximum(env, 0)).astype(np.float32)

def noise_burst(dur, lp_k=None, hp=False, seed=5):
    r = np.random.default_rng(seed)
    s = r.standard_normal(int(dur * sr)).astype(np.float32)
    if lp_k:
        s = np.convolve(s, np.ones(lp_k, dtype=np.float32) / lp_k, mode='same')
    if hp:
        s = s - np.convolve(s, np.ones(40, dtype=np.float32) / 40, mode='same')
    t = np.arange(len(s)) / sr
    env = np.minimum(1, np.minimum(t / 0.03, (dur - t) / 0.05))
    return (s * np.maximum(env, 0)).astype(np.float32)

def sumlen(a, b):
    n2 = max(len(a), len(b))
    out = np.zeros(n2, dtype=np.float32)
    out[:len(a)] += a; out[:len(b)] += b
    return out

def bell(t0, gain=0.16, f=1318):
    dur = 0.85
    t = np.arange(int(dur * sr)) / sr
    s = (np.sin(2 * np.pi * f * t) * 0.55 + np.sin(2 * np.pi * f * 1.5 * t) * 0.3
         + np.sin(2 * np.pi * f * 2.0 * t) * 0.18) * np.exp(-t * 5.5)
    add(s.astype(np.float32), t0, gain)

# ============ SAMPLE WALE SFX (same timings: L3 report + L4 bazaar) ============
buzz = np.concatenate([tone(155, 0.09, 'square'), np.zeros(int(0.05 * sr), dtype=np.float32)] * 3)
add(buzz, 8.72, 0.10); add(buzz, 9.55, 0.09)
bell(15.45); bell(15.78)
noise = rng.standard_normal(int(1.6 * sr)).astype(np.float32)
lp = np.convolve(noise, np.ones(90, dtype=np.float32) / 90, mode='same')
tt = np.arange(len(lp)) / sr
swell = np.minimum(1, tt / 0.25) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.3 * tt))
add((lp * swell * 1.6).astype(np.float32), 15.4, 0.055)
t = np.arange(int(1.0 * sr)) / sr
phase = 2 * np.pi * (880.0 * t + (240.0 - 880.0) * t * t / 2.0)
sweep = np.sin(phase) * np.minimum(1, t / 0.08) * np.minimum(1, (1.0 - t) / 0.15)
add(sweep.astype(np.float32), 15.95, 0.05)

# ============ L4 cont. (s12-s16, 17.0-24.0s) ============
for i, bt in enumerate([17.2, 17.6, 18.0, 18.4]):  # screen beeps utarte hue
    add(tone(1250 - i * 170, 0.07), bt, 0.045)
add(buzz, 19.0, 0.07)  # s13 phone phir bajta hai
for bt in [21.85, 22.25, 22.65]:  # s15 circuit buzzers x3
    add(tone(138, 0.2, 'square'), bt, 0.10)
    add(tone(92, 0.2, 'square'), bt, 0.08)

# ============ L5 shaam (s17-s19, 24.0-28.6s) ============
add(tone(58, 1.1, 'sine', decay=2.6), 24.1, 0.30)  # gehra boom — number girta hai
for i in range(5):
    add(tone(1900, 0.03), 24.3 + i * 0.22, 0.03)  # counter ticks
for i in range(4):  # s18 ghadi tick-tock
    add(tone(2100 if i % 2 == 0 else 1650, 0.028, 'square'), 25.75 + i * 0.4, 0.05)

# ============ L6 do din (s20-s23, 28.6-35.2s) ============
for i, rt in enumerate([28.8, 29.2, 29.6, 30.0]):  # akhbaar barsaat ki sarsarahat
    add(noise_burst(0.28, lp_k=30, seed=30 + i), rt, 0.10)
clack = sumlen(noise_burst(0.07, seed=41), tone(280, 0.09, 'sine', decay=30) * 1.5)
add(clack, 31.05, 0.20)  # rank board flip clack (#3 -> #7)
add(noise_burst(0.4, lp_k=50, seed=42), 34.0, 0.06)

# ============ L7 suspense (s24, 35.2-36.9s) ============
add(tone(52, 0.5, 'sine', decay=6), 35.6, 0.16)  # dhadkan jaisi thump
add(tone(52, 0.5, 'sine', decay=6), 36.3, 0.13)

# ============ L8 FPO (s25-s27, 36.9-41.7s) ============
add(noise_burst(0.45, lp_k=35, seed=51), 37.1, 0.09)  # form slide
mur = noise_burst(1.5, lp_k=110, seed=52)
add((mur * 1.5).astype(np.float32), 38.55, 0.05)  # bheed ki gunj
add(noise_burst(0.25, lp_k=30, seed=53), 38.85, 0.08)
add(noise_burst(0.25, lp_k=30, seed=54), 39.45, 0.08)
thud = sumlen(tone(68, 0.5, 'sine', decay=7) * 1.6, noise_burst(0.12, seed=55) * 0.9)
add(thud, 40.83, 0.34)  # STAMP ki THAP (s27 hit @ u=0.46)

# ============ L9 ek mahina (s28-s30, 41.7-45.7s) ============
for ft in [41.95, 42.35, 42.7]:  # calendar panne flip
    add(noise_burst(0.13, hp=True, seed=int(ft * 10)), ft, 0.09)
t2 = np.arange(int(0.9 * sr)) / sr
ph2 = 2 * np.pi * (620.0 * t2 + (210.0 - 620.0) * t2 * t2 / 2.0)
add((np.sin(ph2) * np.minimum(1, t2 / 0.06) * np.minimum(1, (0.9 - t2) / 0.2)).astype(np.float32), 43.3, 0.04)

# ============ L10 wapasi (s31-s34, 45.7-50.7s) ============
scr = noise_burst(1.0, hp=True, seed=61)
tt3 = np.arange(len(scr)) / sr
add((scr * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt3))).astype(np.float32), 45.8, 0.035)  # pen scratch — laal line
add(tone(88, 1.1, 'saw'), 47.1, 0.028)  # crane winch whir
horn = sumlen(tone(196, 0.9, 'sine', decay=1.2), tone(147, 0.9, 'sine', decay=1.2))
add(horn, 47.3, 0.10)  # jahaz ka horn
lap = noise_burst(1.3, lp_k=260, seed=62)
tt4 = np.arange(len(lap)) / sr
add((lap * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * tt4))).astype(np.float32), 48.35, 0.06)  # paani ki lap
add(horn, 49.25, 0.045)  # door ka horn
chime = sumlen(tone(880, 0.5, 'sine', decay=5), tone(1318, 0.5, 'sine', decay=6))
add(chime, 50.0, 0.05)  # ummeed ki halki ghanti

# ============ ant (s39) ============
bell(58.35, gain=0.08, f=1046)

# ============ TENSE BED (poori video, halka; crash/FPO par zyada, wapasi par halka) ============
ttb = np.arange(n) / sr
env = np.full(n, 0.45, dtype=np.float32)
env = np.where((ttb >= 15.4) & (ttb < 27.2), 1.0, env)
env = np.where((ttb >= 37.0) & (ttb < 43.1), 0.85, env)
env = np.where((ttb >= 47.0) & (ttb < 54.0), 0.32, env)
k = int(0.5 * sr)
env = np.convolve(env, np.ones(k, dtype=np.float32) / k, mode='same')
drone = (np.sin(2 * np.pi * 55 * ttb) * 0.5 + np.sin(2 * np.pi * 82.41 * ttb) * 0.3
         + np.sin(2 * np.pi * 110 * ttb) * 0.18)
pad = (np.sin(2 * np.pi * 220 * ttb) + np.sin(2 * np.pi * 261.63 * ttb) * 0.7
       + np.sin(2 * np.pi * 329.63 * ttb) * 0.5) * 0.16
trem = 0.85 + 0.15 * np.sin(2 * np.pi * 0.4 * ttb)
mix += ((drone + pad) * env * trem * 0.035).astype(np.float32)

# ============ MASTER: loudnorm measure -> gain to -15 LUFS -> soft limit ============
tmp = os.path.join(HERE, '_premaster.wav')
wavfile.write(tmp, sr, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
r = subprocess.run(['ffmpeg', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = re.search(r'\{\s*"input_i".*?\}', r.stderr, re.S)
meas = json.loads(m.group(0))
gain_db = -15.0 - float(meas['input_i'])
mix2 = mix * (10 ** (gain_db / 20.0))
peak = float(np.max(np.abs(mix2)))
if peak > 0.99:
    mix2 *= 0.99 / peak
final = os.path.join(HERE, 'final_audio.wav')
wavfile.write(tmp, sr, (np.clip(mix2, -1, 1) * 32767).astype(np.int16))
# loudnorm measured-stats pass: LUFS -15 rakho, True Peak -1.0 par limit
ln = (f"loudnorm=I=-15:TP=-1.0:LRA=11:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
      f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
      f":offset={meas['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', ln, '-ar', '48000', final], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', final,
                '-c:a', 'libvorbis', '-q:a', '5', os.path.join(HERE, 'mix.ogg')], check=True)
with open(os.path.join(HERE, 'mix.ogg'), 'rb') as fh:
    with open(os.path.join(HERE, 'mix.ogg.b64'), 'w') as fo:
        fo.write(base64.b64encode(fh.read()).decode())
os.remove(tmp)
r2 = subprocess.run(['ffmpeg', '-i', final, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
                    capture_output=True, text=True)
m2 = re.search(r'\{\s*"input_i".*?\}', r2.stderr, re.S)
fin = json.loads(m2.group(0))
print(f'final_audio.wav ready: {DUR:.2f}s @ {sr}Hz | measured {meas["input_i"]} LUFS -> gain {gain_db:+.2f} dB | '
      f'FINAL {fin["input_i"]} LUFS, TP {fin["input_tp"]} dB')
