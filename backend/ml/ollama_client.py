import ollama
from config import OLLAMA_HOST, OLLAMA_MODEL

def get_ai_advice(student_data: dict, prediction: dict) -> str:
    prompt = f"""You are an academic advisor. A student has the following performance data:
- Name: {student_data.get('name')}
- Attendance: {student_data.get('attendance')}%
- Internal Marks Average: {student_data.get('avg_internal')}/100
- Assignment Score: {student_data.get('assignment_score')}/100
- Predicted Grade: {prediction.get('grade')} ({prediction.get('score'):.1f}%)
- Risk Level: {prediction.get('risk')}

Provide brief, actionable academic advice in 2-3 sentences. Be encouraging but honest."""
    try:
        client = ollama.Client(host=OLLAMA_HOST)
        response = client.chat(model=OLLAMA_MODEL, messages=[{'role': 'user', 'content': prompt}])
        return response['message']['content'].strip()
    except Exception as e:
        return f"Unable to generate AI advice at this time. Please ensure Ollama is running with the {OLLAMA_MODEL} model installed."
