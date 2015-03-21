BIN_PATH = $(realpath ./node_modules/.bin)

.PHONY: default start start-static lint-js cleran build

default: start

start:
	@$(BIN_PATH)/gulp dev

lint-js:
	@$(BIN_PATH)/gulp jslint

clean:
	@$(BIN_PATH)/gulp clean

build: build-clean
	@$(BIN_PATH)/gulp build
