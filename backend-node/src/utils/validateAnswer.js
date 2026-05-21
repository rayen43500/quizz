export function validateAnswer(question, answer) {
  if (!answer) return { isCorrect: null, valid: false };

  switch (question.type) {
    case 'multiple_choice': {
      const option = question.options?.find((o) => o.id === answer);
      return { isCorrect: option?.isCorrect ?? false, valid: !!option };
    }
    case 'true_false': {
      const normalized = String(answer).toLowerCase();
      const correct = String(question.correctAnswer).toLowerCase();
      return { isCorrect: normalized === correct, valid: ['true', 'false'].includes(normalized) };
    }
    case 'poll':
      return { isCorrect: null, valid: question.options?.some((o) => o.id === answer) ?? false };
    case 'short_answer': {
      const normalizedAnswer = String(answer).trim().toLowerCase();
      const normalizedCorrect = String(question.correctAnswer || '').trim().toLowerCase();
      return { isCorrect: normalizedAnswer === normalizedCorrect, valid: normalizedAnswer.length > 0 };
    }
    default:
      return { isCorrect: false, valid: false };
  }
}
