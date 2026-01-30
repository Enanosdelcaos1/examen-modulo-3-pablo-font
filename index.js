// BASE DE DATOS DE PREGUNTAS
// Contiene todas las preguntas con sus opciones y la respuesta correcta
const questionsDatabase = [
    { question: "¿Cuál es el resultado de 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
    { question: "¿Cuál es la capital de Francia?", options: ["Londres", "Berlín", "París", "Madrid"], correct: 2 },
    { question: "¿En qué año se descubrió América?", options: ["1492", "1450", "1500", "1510"], correct: 0 },
    { question: "¿Cuál es el planeta más grande del sistema solar?", options: ["Saturno", "Neptuno", "Júpiter", "Tierra"], correct: 2 },
    { question: "¿Cuál es el idioma más hablado en el mundo?", options: ["Inglés", "Mandarín", "Español", "Francés"], correct: 1 },
    { question: "¿Cuál es el elemento químico más abundante en la atmósfera?", options: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Argón"], correct: 2 },
    { question: "¿Cuántos continentes existen?", options: ["5", "6", "7", "8"], correct: 1 },
    { question: "¿Cuál es la velocidad de la luz en el vacío?", options: ["300,000 km/h", "300,000 km/s", "150,000 km/s", "600,000 km/s"], correct: 1 },
    { question: "¿En qué año caída el Muro de Berlín?", options: ["1987", "1989", "1991", "1993"], correct: 1 },
    { question: "¿Cuál es el animal terrestre más rápido?", options: ["León", "Guepardo", "Antílope", "Caballo"], correct: 1 }
];

// FUNCIÓN: Mezcla aleatoriamente las opciones de respuesta
// Garantiza que la respuesta correcta aparezca en diferentes posiciones
function shuffleQuestion(q) {
    const answers = [];
    // Crea un array con las respuestas marcando cuál es la correcta
    q.options.forEach((opt, idx) => {
        answers.push({ text: opt, isCorrect: idx === q.correct });
    });
    
    // Algoritmo de Fisher-Yates para mezclar el array aleatoriamente
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    
    // Retorna la pregunta con las opciones mezcladas y la nueva posición de la respuesta correcta
    return {
        question: q.question,
        options: answers.map(a => a.text),
        correct: answers.findIndex(a => a.isCorrect)
    };
}

// CLASE: Quiz
// Gestiona toda la lógica del juego de preguntas
class Quiz {
    // Constructor: Inicializa el quiz al crear la instancia
    constructor() {
        this.reset();
    }

    // Reinicia todas las variables a su estado inicial
    reset() {
        this.currentIndex = 0;      // Pregunta actual (0-9)
        this.correct = 0;            // Contador de respuestas correctas
        this.incorrect = 0;          // Contador de respuestas incorrectas
        this.isAnswered = false;     // Flag: si ya respondió la pregunta actual
    }

    // Atajo para document.getElementById
    $(id) { return document.getElementById(id); }

    // Inicia un nuevo quiz desde cero
    startQuiz() {
        this.reset();
        this.showScreen('quiz');
        this.loadQuestion();
    }

    // Carga la pregunta actual en pantalla
    loadQuestion() {
        let q = questionsDatabase[this.currentIndex];
        q = shuffleQuestion(q);  // Mezcla las opciones de respuesta
        this.isAnswered = false;

        // Actualizar contador de pregunta
        this.$('currentQuestion').textContent = this.currentIndex + 1;
        
        // Actualizar puntuación actual
        this.$('scoreDisplay').textContent = this.correct;
        
        // Actualizar barra de progreso (porcentaje completado)
        this.$('progressFill').style.width = (this.currentIndex / 10) * 100 + '%';
        
        // Mostrar el texto de la pregunta
        this.$('questionText').textContent = q.question;
        
        // Ocultar botón "siguiente" hasta que responda
        this.$('nextBtn').style.display = 'none';
        
        // Limpiar mensajes de feedback previos
        const feedback = this.$('feedback');
        feedback.classList.remove('show', 'correct', 'incorrect');
        feedback.textContent = '';

        // Crear los botones de opciones dinámicamente
        const container = this.$('optionsContainer');
        container.innerHTML = '';  // Limpiar opciones previas
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.textContent = opt;
            btn.onclick = () => this.selectAnswer(i, q);
            container.appendChild(btn);
        });
    }

    // Procesa la respuesta seleccionada por el usuario
    selectAnswer(idx, q) {
        // Evitar múltiples respuestas a la misma pregunta
        if (this.isAnswered) return;
        this.isAnswered = true;

        // Verificar si la respuesta es correcta
        const isCorrect = idx === q.correct;
        
        // Actualizar contadores
        if (isCorrect) this.correct++;
        else this.incorrect++;

        // Colorear opciones: verde para correcta, roja para incorrecta
        document.querySelectorAll('.option').forEach((opt, i) => {
            opt.classList.add('disabled');  // Desactivar todos los botones
            if (i === q.correct) opt.classList.add('correct');  // Verde
            if (i === idx && !isCorrect) opt.classList.add('incorrect');  // Rojo
        });

        // Mostrar feedback visual (correcto o incorrecto)
        const feedback = this.$('feedback');
        feedback.classList.add('show', isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = isCorrect ? 
            '¡Correcto! Excelente trabajo.' : 
            `Incorrecto. La respuesta correcta es: ${q.options[q.correct]}`;
        
        // Mostrar botón "siguiente pregunta"
        this.$('nextBtn').style.display = 'block';
        
        // Actualizar puntuación en pantalla
        this.$('scoreDisplay').textContent = this.correct;
    }

    // Avanza a la siguiente pregunta o muestra resultados si es la última
    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < 10) {
            this.loadQuestion();  // Cargar siguiente pregunta
        } else {
            this.showResults();   // El quiz terminó, mostrar resultados
        }
    }

    // Muestra la pantalla final con el puntaje y feedback personalizado
    showResults() {
        // Calcular porcentaje de aciertos
        const pct = Math.round((this.correct / 10) * 100);
        
        // Mensaje personalizado según el desempeño
        const msg = this.correct >= 8 ? '¡Excelente! Dominas el tema' 
                  : this.correct >= 5 ? '¡Bien hecho! Vas por buen camino' 
                  : 'Necesitas repasar más';

        // Actualizar elementos de la pantalla de resultados
        this.$('finalScore').textContent = this.correct;          // Respuestas correctas
        this.$('correctCount').textContent = this.correct;         // Contador de correctas
        this.$('incorrectCount').textContent = this.incorrect;     // Contador de incorrectas
        this.$('accuracyPercentage').textContent = pct + '%';     // Porcentaje
        this.$('resultsMessage').textContent = msg;               // Mensaje personalizado
        
        // Mostrar pantalla de resultados
        this.showScreen('results');
    }

    // Cambia entre pantallas (inicio, quiz, resultados)
    showScreen(name) {
        const map = { 
            start: 'startScreen',      // Pantalla inicial
            quiz: 'quizScreen',        // Pantalla del quiz
            results: 'resultsScreen'   // Pantalla de resultados
        };
        
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // Mostrar la pantalla seleccionada
        this.$(map[name]).classList.add('active');
    }

    // Reinicia el quiz completo
    restartQuiz() { this.startQuiz(); }
}

// INSTANCIA GLOBAL DEL QUIZ
const quiz = new Quiz();

// INICIALIZACIÓN: Ejecutar cuando el DOM esté listo
// Muestra la pantalla de inicio al cargar la página
document.addEventListener('DOMContentLoaded', () => quiz.showScreen('start'));
