async function main() {
  const apiKey = 'AIzaSyAuF1QtrhaacPg03PHRCpY4KzO1iE_bVxY'; // Reemplaza con tu clave API de Google Cloud
  const questionInput = document.getElementById('question-input');
  const askButton = document.getElementById('ask-button');
  const responseText = document.getElementById('response-text');
  const microphoneButton = document.getElementById('microphone-button');

  if (!apiKey) {
    responseText.textContent = "API key not provided.  Please set the API key.";
    return;
  }

  let isRecording = false;
  let recognition;

  // Verifica si el navegador soporta la API de reconocimiento de voz
  if ('webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
  } else if ('speechRecognition' in window) {
    recognition = new window.speechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
  } else {
    microphoneButton.style.display = 'none';
    console.warn("Speech recognition is not supported in this browser.");
  }

  // Inicializa el botón del micrófono con el icono
  // microphoneButton.textContent = 'Mic'; // Ya no se usa textContent

  // Evento para el botón del micrófono
  if (recognition) {
    microphoneButton.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
        microphoneButton.classList.remove('recording');
        isRecording = false;
        questionInput.value = ''; // Limpia el input al detener la grabación
        // microphoneButton.textContent = 'Mic'; // Ya no se usa textContent
      } else {
        recognition.start();
        microphoneButton.classList.add('recording');
        isRecording = true;
        questionInput.value = ''; // Limpia el input al iniciar la grabación
        // microphoneButton.textContent = 'Escuchando...'; // Ya no se usa textContent
      }
    });

    // Evento cuando se obtiene un resultado de la transcripción
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      questionInput.value = transcript;
      recognition.stop();
      microphoneButton.classList.remove('recording');
      isRecording = false;
      // microphoneButton.textContent = 'Mic'; // Ya no se usa textContent
    };

    // Evento en caso de error
    recognition.onerror = (event) => {
      console.error('Error durante el reconocimiento de voz:', event.error);
      responseText.textContent = "Error al reconocer el habla. Por favor, inténtalo de nuevo.";
      microphoneButton.classList.remove('recording');
      isRecording = false;
      // microphoneButton.textContent = 'Mic'; // Ya no se usa textContent
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.stop();
        microphoneButton.classList.remove('recording');
        isRecording = false;
        // microphoneButton.textContent = 'Mic'; // Ya no se usa textContent
      }
    }
  }

  askButton.addEventListener('click', async () => {
    const question = questionInput.value;
    if (!question || question.trim() === "") {
      responseText.textContent = "Por favor, ingresa una pregunta.";
      return;
    }

    responseText.textContent = "Cargando respuesta...";

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: question }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error from Google AI API:", data.error);
        responseText.textContent = "Error: " + data.error.message;
      } else {
        let text = "";
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
          text = data.candidates[0].content.parts[0].text;
        } else {
          text = "No se recibió respuesta de la IA.";
        }
        responseText.textContent = text;
      }

    } catch (error) {
      console.error("Error:", error);
      responseText.textContent = "Ocurrió un error: " + error;
    }
    finally {
      questionInput.value = "";
    }
  });
}

main();

