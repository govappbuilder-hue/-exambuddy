const ALLOWED_SUBJECTS = new Set([
  'maths', 'constitution', 'history', 'geography', 'science', 'gujarati', 'english',
  'current_affairs', 'gk', 'economics', 'computer', 'reasoning', 'gujarati_vyakran',
  'gujarati_sahitya', 'law', 'heritage', 'pub_ad', 'polity', 'current-affairs'
]);

export function validateSubject(subject) {
  if (typeof subject !== 'string') return false;
  return ALLOWED_SUBJECTS.has(subject.trim().toLowerCase());
}
