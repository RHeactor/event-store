.PHONY: dist

dist:
	rm -rf $@
	./node_modules/.bin/tsc
