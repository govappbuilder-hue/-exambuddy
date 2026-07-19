export function getDoubtSolverFallbackMessage(error = '') {
  const normalized = String(error || '').toLowerCase();

  if (normalized.includes('quota') || normalized.includes('rate limit') || normalized.includes('429')) {
    return 'માફ કરશો! હમણાં AI service મર્યાદામાં છે. થોડીવાર પછી ફરી પ્રયત્ન કરો અથવા વધુ clarified question પૂછો.';
  }

  if (normalized.includes('timeout') || normalized.includes('fetch')) {
    return 'માફ કરશો! response late થયુ. ઈન્ટરનેટ ચેક કરો અને ફરીથી પ્રયાસ કરો.';
  }

  return 'માફ કરશો! હમણાં જવાબ મેળવવામાં નિષ્ફલ ગયુ. અત્યારે તમારો પ્રશ્ન હું કાંઈક alternative રીતે સમજાવી શકું છું, અથવા થોડીવાર પછી ફરી પ્રયાસ કરો.';
}
