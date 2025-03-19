import whisper
import json
import os
import logging
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Loading Whisper model 'small'...")
try:
    model = whisper.load_model("small")
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {str(e)}")
    raise

def load_tutorial(tutorial_file):
    if not os.path.exists(tutorial_file):
        logger.error(f"Tutorial file {tutorial_file} does not exist")
        raise FileNotFoundError(f"Tutorial file {tutorial_file} does not exist")
    with open(tutorial_file, "r") as f:
        tutorial = json.load(f)
    logger.info(f"Tutorial loaded: {json.dumps(tutorial, indent=2)}")
    return tutorial

def transcribe_audio(audio_file, expected_narration):
    if not os.path.exists(audio_file):
        logger.error(f"Audio file {audio_file} not found")
        raise FileNotFoundError(f"Audio file {audio_file} not found")
    logger.info("Transcribing audio with Whisper...")
    result = model.transcribe(audio_file, language="en", initial_prompt=expected_narration, word_timestamps=True)
    transcription = result["text"]
    logger.info(f"Full transcription: {transcription}")
    return result, transcription

def verify_commands(result, command, terminal_commands, expected_narration):
    transcription = result["text"].lower()
    narration = expected_narration.lower()

    # Count single quotes
    narration_quotes = narration.count("'")
    transcription_quotes = transcription.count("'")
    logger.info(f"Single quotes in narration: {narration_quotes}")
    logger.info(f"Single quotes in transcription: {transcription_quotes}")

    # Character counts
    narration_chars = len(narration)
    transcription_chars = len(transcription)
    logger.info(f"Characters in narration: {narration_chars}")
    logger.info(f"Characters in transcription: {transcription_chars}")

    # Find quoted positions in narration
    narration_quoted_positions = []
    for i in range(len(narration)):
        if narration[i] == "'":
            narration_quoted_positions.append(i)
    logger.info(f"Quoted positions in narration: {narration_quoted_positions}")

    # Find commands after quotes
    command_len = len(command)
    narration_commands = []
    for pos in narration_quoted_positions:
        if pos + command_len + 1 < len(narration):  # +1 for closing quote
            next_chars = narration[pos + 1:pos + command_len + 1]
            if next_chars == command and narration[pos + command_len + 1] == "'":
                # Check if it’s a command (not solo 'ls')
                after_quote = narration[pos + command_len + 2:pos + command_len + 5]  # Look ahead a few chars
                if after_quote.strip() and not after_quote.startswith(' '):  # Not standalone
                    narration_commands.append(pos)
    logger.info(f"Quoted '{command}' command positions in narration: {narration_commands}")

    # Skip first command if it’s solo
    if narration_commands and len(terminal_commands) > 1:
        narration_commands.pop(0)  # Remove first solo 'ls'
    logger.info(f"Adjusted command positions (after skipping solo): {narration_commands}")

    # Match to transcription timestamps
    timestamps = []
    word_index = 0
    for segment in result["segments"]:
        if "words" in segment:
            for word_info in segment["words"]:
                word = word_info["word"].lower()
                if word.startswith(command):
                    char_pos = transcription[word_index:].find(command) + word_index
                    # Check proximity to narration positions
                    for narr_pos in narration_commands:
                        if abs(char_pos - narr_pos) < 20:  # Rough alignment
                            timestamps.append(word_info["start"])
                            logger.info(f"Matched '{command}' at {word_info['start']}s (transcription pos: {char_pos})")
                            break
                word_index += len(word_info["word"]) + 1
                if len(timestamps) == len(terminal_commands):
                    break
        if len(timestamps) == len(terminal_commands):
            break

    # Fallback if not enough timestamps
    if len(timestamps) < len(terminal_commands):
        logger.warning(f"Found {len(timestamps)} timestamps, expected {len(terminal_commands)}. Estimating...")
        words_per_sec = 150 / 60
        narration_words = len(re.findall(r'\w+', expected_narration))
        total_duration = narration_words / words_per_sec
        for i in range(len(timestamps), len(terminal_commands)):
            est_time = (i + 1) * (total_duration / len(terminal_commands))
            timestamps.append(est_time)
            logger.info(f"Estimated timestamp for command {i + 1}: {est_time}s")

    return timestamps

def main():
    audio_file = "output/narration.mp3"
    tutorial_file = "output/tutorial.json"
    output_file = "output/audio_timestamps.json"

    tutorial = load_tutorial(tutorial_file)
    expected_narration = " ".join(step["narration_text"] for step in tutorial["steps"])
    command = tutorial["command"]
    terminal_commands = [cmd for step in tutorial["steps"] for cmd in step["step_command_terminal"]]

    result, transcription = transcribe_audio(audio_file, expected_narration)
    timestamps = verify_commands(result, command, terminal_commands, expected_narration)

    report = {
        "transcription": transcription,
        "expected_narration": expected_narration,
        "timestamps": {cmd: ts for cmd, ts in zip(terminal_commands, timestamps)}
    }
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"Audio timestamps saved to {output_file}")

if __name__ == "__main__":
    main()