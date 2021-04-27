

clean:
	rm -rf dist/
build:
	npm install .
	ncc build --license licenses.txt

rebuid: clean build

dev-push: build
	git cm "dev";git push
