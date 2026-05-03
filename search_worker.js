// search.worker.js — VoteWise Search Web Worker
// Handles FAQ and Glossary filtering off the main thread

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'FILTER_FAQ': {
      const { data, term } = payload;
      const lower = term.toLowerCase();
      const results = lower
        ? data.filter(f =>
            f.question.toLowerCase().includes(lower) ||
            f.answer.toLowerCase().includes(lower)
          )
        : data;
      self.postMessage({ type: 'FAQ_RESULTS', results, term });
      break;
    }

    case 'FILTER_GLOSSARY': {
      const { data, term } = payload;
      const lower = term.toLowerCase();
      const results = lower
        ? data.filter(item =>
            item.term.toLowerCase().includes(lower) ||
            item.definition.toLowerCase().includes(lower)
          )
        : data;
      self.postMessage({ type: 'GLOSSARY_RESULTS', results, term });
      break;
    }

    case 'BUILD_SEARCH_INDEX': {
      // Pre-compute lowercase versions for faster repeated searches
      const { faqData, glossaryData } = payload;
      const faqIndex = faqData.map(f => ({
        ...f,
        _qLower: f.question.toLowerCase(),
        _aLower: f.answer.toLowerCase()
      }));
      const glossaryIndex = glossaryData.map(g => ({
        ...g,
        _tLower: g.term.toLowerCase(),
        _dLower: g.definition.toLowerCase()
      }));
      self.postMessage({ type: 'INDEX_READY', faqIndex, glossaryIndex });
      break;
    }

    default:
      self.postMessage({ type: 'ERROR', message: `Unknown message type: ${type}` });
  }
});