TESTS = \
	test/test.js
  
test:
	mocha --reporter spec --ui bdd --timeout 2000 $(TESTS)

.PHONY: test test
