import whisper
import json
import os
import argparse
import logging
import bisect

# Setup logging
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
        return json.load(f)

def transcribe_audio(audio_file, expected_narration):
    if not os.path.exists(audio_file):
        logger.error(f"Audio file {audio_file} not found")
        raise FileNotFoundError(f"Audio file {audio_file} not found")
    logger.info("Transcribing audio with Whisper...")
    result = model.transcribe(audio_file, language="en", initial_prompt=expected_narration, word_timestamps=True)
    return result, result["text"]

def build_position_to_timestamp_mapping(result):
    """Build a mapping from character positions to word timestamps."""
    position_to_timestamp = {}
    transcription = ""
    char_index = 0
    for segment in result["segments"]:
        for word_info in segment["words"]:
            word = word_info["word"]
            start_time = word_info["start"]
            # Add space before word if transcription isn’t empty
            if transcription:
                transcription += " "
                char_index += 1
            transcription += word
            word_start_pos = char_index
            # Map each character in the word to its start time
            for pos in range(word_start_pos, word_start_pos + len(word)):
                position_to_timestamp[pos] = start_time
            char_index += len(word)
    return position_to_timestamp, transcription

def find_all_positions(text, substring):
    """Find all starting positions of substring in text."""
    positions = []
    start = 0
    while True:
        start = text.find(substring, start)
        if start == -1:
            break
        positions.append(start)
        start += 1  # Move past current position
    return positions

def validate_and_sync(audio_file, tutorial_file):
    # Load tutorial and transcribe audio
    tutorial = load_tutorial(tutorial_file)
    expected_narration = " ".join(step["narration_text"] for step in tutorial["steps"])
    result, transcription = transcribe_audio(audio_file, expected_narration)

    # Build the timestamp mapping
    position_to_timestamp, _ = build_position_to_timestamp_mapping(result)

    # Step 1: Find all {command} positions in transcription
    command = tutorial["command"].lower()  # e.g., "cat"
    transcription_lower = transcription.lower()
    command_positions = find_all_positions(transcription_lower, command)
    logger.info(f"All '{command}' positions in transcription: {command_positions}")

    # Process each step and command
    narration_lower = expected_narration.lower()
    narration_offset = 0
    for step_idx, step in enumerate(tutorial["steps"]):
        step_text = step["narration_text"].lower()
        step_start = narration_offset
        step_end = narration_offset + len(step_text)

        for cmd in step["step_command_terminal"]:
            cmd_lower = cmd.lower()
            cmd_len = len(cmd)  # Length of full command, e.g., 12 for "cat file.txt"

            # Find quote-start position in narration for this command
            narration_positions = []
            i = step_start
            while i < step_end - cmd_len - 1:
                if narration_lower[i] == "'":
                    start = i
                    i += 1
                    while i < step_end and narration_lower[i] != "'":
                        i += 1
                    if i < step_end and narration_lower[start + 1:i] == cmd_lower:
                        narration_positions.append(start)
                    i += 1
                else:
                    i += 1

            if not narration_positions:
                logger.info(f"Command '{cmd}' not found in narration")
                continue

            # Step 2: For each narration position, find closest {command} before
            quote_pos = narration_positions[0]  # Take first occurrence
            left_index = bisect.bisect_left(command_positions, quote_pos)
            if left_index == 0:
                logger.info(f"Command '{cmd}' - Narration quote at {quote_pos}, no '{command}' found before in transcription")
                continue
            p = command_positions[left_index - 1]  # Closest "cat" before quote_pos

            # Step 3: Calculate full command range in transcription
            end_pos = p + cmd_len  # e.g., 93 + 12 = 105
            snippet = transcription[p:end_pos] if end_pos <= len(transcription) else transcription[p:]

            # Step 4: Get the timestamp for the command’s starting position
            timestamp = position_to_timestamp.get(p, "Unknown")

            # Step 5: Handle the timestamp for logging
            timestamp_str = timestamp if isinstance(timestamp, str) else f"{timestamp:.2f}"

            # Log with timestamp included
            logger.info(f"Command '{cmd}' - Narration quote at {quote_pos}, Transcription '{command}' at {p}, full command range {p}-{end_pos}: '{snippet}', timestamp {timestamp_str}s")

            # Step 6: Search for other {command} before and after
            before_commands = [q for q in command_positions if q < p]
            after_commands = [q for q in command_positions if q > end_pos]
            logger.info(f"Other '{command}' before {p}: {before_commands}, after {end_pos}: {after_commands}")

        narration_offset = step_end + 1  # +1 for space between steps

def main():
    parser = argparse.ArgumentParser(description="Validate audio narration and sync commands")
    parser.add_argument("--audio", required=True, help="Input audio file")
    parser.add_argument("--tutorial", required=True, help="Input tutorial JSON")
    args = parser.parse_args()
    validate_and_sync(args.audio, args.tutorial)

if __name__ == "__main__":
    main()