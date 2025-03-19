import subprocess
import os
import json
import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CONFIG = {
    "command": "ls",
    "steps": 3,
    "duration": 30,
    "output_dir": "output",
    "tutorial_file": "output/tutorial.json",
    "audio_file": "output/narration.mp3",
    "video_file": "output/recording.mp4",
    "final_file": "output/final_guide.mp4"
}

def run_command(cmd, description, background=False):
    logger.info(f"Running {description}...")
    try:
        if background:
            subprocess.Popen(cmd, shell=True)
        else:
            subprocess.run(cmd, check=True, shell=True)
        logger.info(f"{description} {'started' if background else 'completed successfully'}.")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error in {description}: {e}")
        raise

def main():
    os.makedirs(CONFIG["output_dir"], exist_ok=True)

    run_command(
        f"python3 generate_narration.py --command {CONFIG['command']} --steps {CONFIG['steps']} --duration {CONFIG['duration']}",
        "Narration Generator"
    )

    run_command(
        f"python3 text_to_speech.py --input {CONFIG['tutorial_file']} --output {CONFIG['audio_file']} --speaking-rate 15 --max-retries 3",
        "Text-to-Speech"
    )

    run_command(
        f"python3 validate_audio.py --audio {CONFIG['audio_file']} --tutorial {CONFIG['tutorial_file']}",
        "Audio Validation and Sync Prep"
    )

    # REMOVED: Docker start command - now started manually
    # run_command(
    #     "docker run -it -p 8080:8080 -v $(pwd)/output:/output alpine-screencast:latest &",
    #     "Docker Container for Screen Recording",
    #     background=True
    # )
    # time.sleep(2)  # Removed along with Docker start

    run_command(
        f"node command_scheduler.js --input {CONFIG['tutorial_file']} --timestamps output/audio_timestamps.json",
        "Command Scheduler"
    )

    logger.info("Waiting 10 seconds for recording to finalize...")
    time.sleep(10)

    run_command(
        f"ffmpeg -i {CONFIG['video_file']} -i {CONFIG['audio_file']} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 {CONFIG['final_file']}",
        "Final Video Assembly"
    )

    logger.info(f"Pipeline complete! Final video: {CONFIG['final_file']}")

if __name__ == "__main__":
    main()