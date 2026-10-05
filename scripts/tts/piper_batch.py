"""Reads JSON lines {"text", "out"} on stdin and writes one WAV per line, loading the voice once."""
import json
import sys
import wave

from piper import PiperVoice, SynthesisConfig

model, length_scale, sentence_silence = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
voice = PiperVoice.load(model)
config = SynthesisConfig(length_scale=length_scale)
silence = bytes(int(voice.config.sample_rate * sentence_silence) * 2)

for line in sys.stdin:
    if not line.strip():
        continue
    job = json.loads(line)
    with wave.open(job["out"], "wb") as wav:
        for i, chunk in enumerate(voice.synthesize(job["text"], config)):
            if i == 0:
                wav.setframerate(chunk.sample_rate)
                wav.setsampwidth(chunk.sample_width)
                wav.setnchannels(chunk.sample_channels)
            else:
                wav.writeframes(silence)
            wav.writeframes(chunk.audio_int16_bytes)
    print(job["out"], flush=True)
