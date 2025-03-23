import ollama

# Test prompt (same as before, with "cat", 5 steps, 120 seconds)
command = "cat"
steps = 4
duration = 60
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

# Generate response from gemma:4b
try:
    print("Generating response with gemma:4b...")
    response = ollama.generate(
        model="gemma3:4b",
        prompt=prompt
    )
    print("Generated response:")
    print(response['response'])
except Exception as e:
    print(f"Error: {e}")
    print("Ensure Ollama is running (`ollama serve`) and gemma:4b is pulled (`ollama pull gemma3:4b`)")