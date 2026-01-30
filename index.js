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

class Quiz {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentIndex = 0;
        this.correct = 0;
        this.incorrect = 0;
        this.isAnswered = false;
        this.selectedOptionIndex = 0;
    }

    $(id) { return document.getElementById(id); }

    startQuiz() {
        this.reset();
        this.showScreen('quiz');
        this.loadQuestion();
        this.setupKeyboardEvents();
    }

    setupKeyboardEvents() {
        const handleKeyDown = (e) => {
            const quizScreen = this.$('quizScreen');
            if (!quizScreen.classList.contains('active')) return;

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateOptions(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.isAnswered) this.nextQuestion();
                else this.selectAnswer(this.selectedOptionIndex, questionsDatabase[this.currentIndex]);
            }
        };
        
        document.removeEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', handleKeyDown);
    }

    navigateOptions(direction) {
        const options = document.querySelectorAll('.option:not(.disabled)');
        if (options.length === 0) return;
        
        this.selectedOptionIndex = (this.selectedOptionIndex + direction + options.length) % options.length;
        document.querySelectorAll('.option').forEach((opt, i) => {
            opt.classList.toggle('focused', i === this.selectedOptionIndex);
        });
    }

    loadQuestion() {
        const q = questionsDatabase[this.currentIndex];
        this.isAnswered = false;
        this.selectedOptionIndex = 0;

        this.$('currentQuestion').textContent = this.currentIndex + 1;
        this.$('scoreDisplay').textContent = this.correct;
        this.$('progressFill').style.width = (this.currentIndex / 10) * 100 + '%';
        this.$('questionText').textContent = q.question;
        this.$('nextBtn').style.display = 'none';
        
        const feedback = this.$('feedback');
        feedback.classList.remove('show', 'correct', 'incorrect');
        feedback.textContent = '';

        const container = this.$('optionsContainer');
        container.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option' + (i === 0 ? ' focused' : '');
            btn.textContent = opt;
            btn.onclick = () => this.selectAnswer(i, q);
            container.appendChild(btn);
        });
    }

    selectAnswer(idx, q) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const isCorrect = idx === q.correct;
        if (isCorrect) this.correct++;
        else this.incorrect++;

        document.querySelectorAll('.option').forEach((opt, i) => {
            opt.classList.add('disabled');
            opt.classList.remove('focused');
            if (i === q.correct) opt.classList.add('correct');
            if (i === idx && !isCorrect) opt.classList.add('incorrect');
        });

        const feedback = this.$('feedback');
        feedback.classList.add('show', isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = isCorrect ? '¡Correcto! Excelente trabajo.' : `Incorrecto. La respuesta correcta es: ${q.options[q.correct]}`;
        
        this.$('nextBtn').style.display = 'block';
        this.$('scoreDisplay').textContent = this.correct;
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < 10) this.loadQuestion();
        else this.showResults();
    }

    showResults() {
        const pct = Math.round((this.correct / 10) * 100);
        const msg = this.correct >= 8 ? '¡Excelente! Dominas el tema' 
                  : this.correct >= 5 ? '¡Bien hecho! Vas por buen camino' 
                  : 'Necesitas repasar más';

        this.$('finalScore').textContent = this.correct;
        this.$('correctCount').textContent = this.correct;
        this.$('incorrectCount').textContent = this.incorrect;
        this.$('accuracyPercentage').textContent = pct + '%';
        this.$('resultsMessage').textContent = msg;
        this.showScreen('results');
    }

    showScreen(name) {
        const map = { start: 'startScreen', quiz: 'quizScreen', results: 'resultsScreen' };
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.$(map[name]).classList.add('active');
    }

    restartQuiz() { this.startQuiz(); }
}

const quiz = new Quiz();
document.addEventListener('DOMContentLoaded', () => quiz.showScreen('start'));
