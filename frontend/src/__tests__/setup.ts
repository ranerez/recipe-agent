// Global test setup — runs before every test file.
// localStorage is provided by jsdom; clear it between tests.
beforeEach(() => {
  localStorage.clear();
});
