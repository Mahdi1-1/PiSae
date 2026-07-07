import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { provideIcons } from '@ng-icons/core';
import { lucideTimer, lucideLoader2 } from '@ng-icons/lucide';

@Component({
  standalone: false,
  selector: 'app-quiz',
  providers: [
    provideIcons({ lucideTimer, lucideLoader2 })
  ],
  template: `
    <div class="quiz-container animate-fade-in-up" *ngIf="quiz">
      <div class="quiz-card glass-panel">
        <div class="quiz-header">
          <h1>Quiz Technique</h1>
          <p>Veuillez répondre à ces questions pour valider votre candidature.</p>
        </div>

        <div *ngIf="!completed" class="quiz-content">
          <div class="timer-section" [class.warning]="timeLeft < 30">
            <div class="timer-info">
              <span class="timer-label"><ng-icon name="lucideTimer"></ng-icon> Temps restant</span>
              <span class="timer-value">{{ formatTime(timeLeft) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
              <div class="h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                   [class.bg-red-600]="timeLeft < 30" 
                   [class.bg-blue-600]="timeLeft >= 30"
                   [style.width.%]="(timeLeft / (quiz.timeLimit || 120)) * 100"></div>
            </div>
          </div>

          <div *ngFor="let question of quiz.questions; let i = index" class="question-block">
            <h3>Question {{ i + 1 }}: {{ question.questionText }}</h3>
            <div class="options-group">
              <label *ngFor="let option of question.options; let j = index" class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" [class.border-blue-500]="answers[i] === j" [class.bg-blue-50]="answers[i] === j">
                <input type="radio" [name]="'question-' + i" [value]="j" [(ngModel)]="answers[i]" class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="text-sm font-medium text-gray-700">{{ option }}</span>
              </label>
            </div>
          </div>

          <div class="quiz-actions">
            <button type="button" class="btn-primary-inline px-8 py-3 rounded-xl disabled:opacity-50" (click)="submitQuiz()" [disabled]="!isAllAnswered()">
              Soumettre le quiz
            </button>
          </div>
        </div>

        <div *ngIf="completed" class="result-content">
          <div class="score-display">
            <h2>Résultat: {{ quiz.score | number:'1.0-1' }}%</h2>
            <div class="score-bar-container">
              <div class="score-bar" [style.width.%]="quiz.score" [class]="quiz.score >= 70 ? 'high' : (quiz.score >= 40 ? 'medium' : 'low')"></div>
            </div>
            <p *ngIf="quiz.score >= 70">Excellent travail ! Votre score a été transmis au recruteur.</p>
            <p *ngIf="quiz.score < 70 && quiz.score >= 40">Bon effort. Votre score a été transmis au recruteur.</p>
            <p *ngIf="quiz.score < 40">Vous pouvez faire mieux. Votre score a été transmis au recruteur.</p>
          </div>

          <div class="review-section">
            <h3>Révision des questions</h3>
            <div *ngFor="let question of quiz.questions; let i = index" class="review-block">
              <p class="review-question"><strong>{{ i + 1 }}. {{ question.questionText }}</strong></p>
              <p class="review-answer" [class.correct]="question.candidateAnswerIndex === question.correctAnswerIndex" [class.incorrect]="question.candidateAnswerIndex !== question.correctAnswerIndex">
                Votre réponse : {{ question.options[question.candidateAnswerIndex] }}
              </p>
              <p *ngIf="question.candidateAnswerIndex !== question.correctAnswerIndex" class="correct-answer">
                Réponse correcte : {{ question.options[question.correctAnswerIndex] }}
              </p>
              <p class="explanation"><em>Note : {{ question.explanation }}</em></p>
            </div>
          </div>

          <div class="quiz-actions">
            <button type="button" class="btn-secondary-inline px-8 py-3 rounded-xl" routerLink="/community/marketplace/my-applications">
              Retour à mes candidatures
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-state flex flex-col items-center justify-center p-12">
      <ng-icon name="lucideLoader2" class="animate-spin text-4xl text-blue-600 mb-4"></ng-icon>
      <p>Chargement du quiz...</p>
    </div>
  `,
  styles: [`
    .quiz-container { max-width: 800px; margin: 40px auto; padding: 0 16px; }
    .quiz-card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .quiz-header { text-align: center; margin-bottom: 40px; }
    .quiz-header h1 { font-size: 28px; font-weight: 800; color: var(--co-secondary); margin-bottom: 8px; }
    .quiz-header p { color: var(--co-text-muted); }

    .question-block { margin-bottom: 32px; padding: 24px; background: var(--co-background); border-radius: 16px; }
    .question-block h3 { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: var(--co-secondary); }
    .options-group { display: flex; flex-direction: column; gap: 12px; }

    .quiz-actions { display: flex; justify-content: center; margin-top: 40px; }
    .quiz-actions button { padding: 8px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; }

    .score-display { text-align: center; margin-bottom: 40px; padding: 32px; background: var(--co-background); border-radius: 24px; }
    .score-display h2 { font-size: 32px; font-weight: 800; color: var(--co-secondary); margin-bottom: 16px; }
    .score-bar-container { height: 12px; background: rgba(0,0,0,0.05); border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
    .score-bar { height: 100%; transition: width 1s ease-out; }
    .score-bar.high { background: var(--co-success); }
    .score-bar.medium { background: var(--co-warning); }
    .score-bar.low { background: var(--co-danger); }

    .review-section { margin-top: 40px; }
    .review-section h3 { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
    .review-block { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--co-background); }
    .review-question { margin-bottom: 8px; font-size: 16px; }
    .review-answer { font-weight: 600; margin-bottom: 4px; }
    .review-answer.correct { color: var(--co-success); }
    .review-answer.incorrect { color: var(--co-danger); }
    .correct-answer { color: var(--co-success); font-weight: 600; margin-bottom: 4px; }
    .explanation { color: var(--co-text-muted); font-size: 14px; }

    .loading-state { text-align: center; padding: 100px; color: var(--co-text-muted); }

    .timer-section { margin-bottom: 32px; padding: 20px; background: #f8f9fa; border-radius: 16px; }
    .timer-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .timer-label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--co-secondary); }
    .timer-value { font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 800; color: var(--co-primary); }
    .timer-section.warning .timer-value { color: var(--co-danger); animation: pulse 1s infinite; }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class QuizComponent implements OnInit, OnDestroy {
  quiz: any;
  answers: number[] = [];
  loading = false;
  completed = false;
  quizId = '';
  timeLeft = 0;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketplaceService
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    this.loadQuiz();
  }

  loadQuiz() {
    this.loading = true;
    this.marketplaceService.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.completed = quiz.completed;
        this.answers = new Array(quiz.questions.length).fill(null);
        this.loading = false;
        
        if (!this.completed) {
          this.timeLeft = quiz.timeLimit || 120;
          this.startTimer();
        }
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement du quiz');
      }
    });
  }

  isAllAnswered(): boolean {
    return this.answers.every(a => a !== null);
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
        this.submitQuiz(true);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  submitQuiz(force = false) {
    if (!force && !this.isAllAnswered()) return;

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.loading = true;
    this.marketplaceService.submitQuiz(this.quizId, this.answers).subscribe({
      next: (result) => {
        this.quiz = result;
        this.completed = true;
        this.loading = false;
        if (force) {
          alert('Temps écoulé ! Quiz soumis automatiquement.');
        } else {
          alert('Quiz soumis avec succès !');
        }
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors de la soumission du quiz');
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
