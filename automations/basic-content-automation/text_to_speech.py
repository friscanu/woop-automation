from zyphra import ZyphraClient
import json
import argparse
import os
import logging
import time

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Zyphra client
api_key = os.environ.get("ZYPHRA_API_KEY")
if not api_key:
    raise ValueError("ZYPHRA_API_KEY environment variable not set")
client = ZyphraClient(api_key=api_key)

def generate_audio(tutorial_file, output_file, speaking_rate=15, max_retries=3):
    if not os.path.exists(tutorial_file):
        logger.error(f"Tutorial file {tutorial_file} does not exist")
        raise FileNotFoundError(f"Tutorial file {tutorial_file} does not exist")
    
    with open(tutorial_file, "r") as f:
        tutorial = json.load(f)
    
    # Combine narration text from all steps
    narration = " ".join(step["narration_text"] for step in tutorial["steps"])
    logger.info(f"Generating audio for full narration (length: {len(narration)} chars) with speaking_rate={speaking_rate}...")
    
    for attempt in range(max_retries):
        try:
            audio_data = client.audio.speech.create(
                text=narration,
                speaking_rate=speaking_rate,
                model="zonos-v0.1-transformer"
            )
            
            if isinstance(audio_data, bytes):
                with open(output_file, "wb") as f:
                    f.write(audio_data)
                logger.info(f"Audio saved as {output_file}")
                return
            else:
                raise ValueError(f"Unexpected audio data format: {type(audio_data)}")
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {str(e)}")
            if attempt + 1 == max_retries:
                logger.error(f"Failed to generate audio after {max_retries} attempts")
                raise
            time.sleep(2)  # Wait before retrying

def main():
    parser = argparse.ArgumentParser(description="Convert full narration to audio")
    parser.add_argument("--input", required=True, help="Input tutorial JSON")
    parser.add_argument("--output", default="output/narration.mp3", help="Output audio file")
    parser.add_argument("--speaking-rate", type=float, default=15, help="Speaking rate (must be >= 5)")
    parser.add_argument("--max-retries", type=int, default=3, help="Max retries for API call")
    args = parser.parse_args()

    if args.speaking_rate < 5:
        raise ValueError("Speaking rate must be greater than or equal to 5")
    
    generate_audio(args.input, args.output, args.speaking_rate, args.max_retries)

if __name__ == "__main__":
    main()