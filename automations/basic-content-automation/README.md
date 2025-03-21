Two environment variables need to be created, ANTHROPIC_API_KEY and ZYPHRA_API_KEY, these are api keys for external LLM's and can be easily replaced with others.


start_pipeline.py: can be used to set {command}, {steps} and {duration}, example : cat(command), 3(steps), 30(seconds) and is the start of the pipeline.
generate_narration.py: Api call to generate steps and narration uses ANTHROPIC_API_KEY
text_to_speech.py: takes the {narration} and makes another api call to created the audio file, narration.mp3.
validate_audio.py: take {narration} and compares it with the narration.mp3 and creates output/audio_timestamps.json
command_scheduler.js: uses output/audio_timestamps.json to send websocket commands to the docker container "shell-recorder"(does it on port 8080
