import ollama
import json
import os
import argparse
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def generate_narration(command, steps, duration):
    prompt = f"""
    Create a friendly, engaging narration explaining the Unix command "{command}" in exactly {steps} steps. 
    The total narration should take approximately {duration} seconds when read at 150 words per minute (about {duration * 2.5} words).

    For each step, use this EXACT format (including headers and bold keys):
    ## Step 1
    **title**: "Main tutorial title"(should be the same for all steps)
    **step_title**: "Step-specific title"(should be descriptive of the step)
    **step_command_terminal**: contains variations of "{command}" (for example "cat filename.txt" : "cat filename1.txt filename2.txt") AND shound not contain only {command}.
    **narration_text**: "Engaging explanation for the command "{command}"
    **step_duration**: Duration in seconds for the narration for this step (e.g. 10)

    Ensure each step has all required fields AND THAT narration_text contains the FULL commands pasted in step_command_terminal without a refercence on how long the stap takes
    Do not deviate from the format or the initial command.
    """
    try:
        print("Generating response with gemma3:4b...")
        response = ollama.generate(
            model="gemma3:4b",
            prompt=prompt
        )
        raw_text = response['response']
        logger.info(f"Raw response from Ollama:\n{raw_text}")
        return raw_text
    except Exception as e:
        logger.error(f"Ollama API error: {str(e)}")
        raise

def parse_to_json(raw_text, command):
    steps = []
    current_step = {}
    lines = raw_text.splitlines()
    for line in lines:
        line = line.strip()
        if line.startswith("## Step"):
            if current_step:
                steps.append(current_step)
            current_step = {}
        elif line.startswith("**title**:"):
            current_step["title"] = line.split(":", 1)[1].strip().strip('"')
        elif line.startswith("**step_title**:"):
            current_step["step_title"] = line.split(":", 1)[1].strip().strip('"')
        elif line.startswith("**step_command_terminal**:"):
            current_step["step_command_terminal"] = [cmd.strip().strip('"') for cmd in line.split(":", 1)[1].split(":")]
        elif line.startswith("**narration_text**:"):
            current_step["narration_text"] = line.split(":", 1)[1].strip().strip('"')
        elif line.startswith("**step_duration**:"):
            current_step["step_duration"] = int(line.split(":", 1)[1].strip())
    if current_step:
        steps.append(current_step)
    
    # Fallback if no steps are parsed
    if not steps:
        logger.warning("No steps parsed from Ollama response. Using fallback step.")
        steps.append({
            "title": f"Exploring the {command} Command",
            "step_title": f"Basic {command} Usage",
            "step_command_terminal": [f"{command} file.txt"],
            "narration_text": f"Welcome! Let’s dive into '{command} file.txt'—a simple way to use the '{command}' command!",
            "step_duration": 15
        })
    
    return {"command": command, "steps": steps, "total_duration": sum(step["step_duration"] for step in steps)}

def main():
    parser = argparse.ArgumentParser(description="Generate tutorial narration with Ollama")
    parser.add_argument("--command", required=True, help="Unix command to explain")
    parser.add_argument("--steps", type=int, required=True, help="Number of steps")
    parser.add_argument("--duration", type=int, required=True, help="Total duration in seconds")
    parser.add_argument("--output", default="output/tutorial.json", help="Output JSON file")
    args = parser.parse_args()

    logger.info(f"Generating narration for {args.command}...")
    raw_narration = generate_narration(args.command, args.steps, args.duration)
    tutorial_data = parse_to_json(raw_narration, args.command)
    
    with open(args.output, "w") as f:
        json.dump(tutorial_data, f, indent=2)
    logger.info(f"Tutorial saved to {args.output}")

if __name__ == "__main__":
    main()