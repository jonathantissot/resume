.PHONY: build deploy invalidate all

all: build deploy invalidate

build:
	$(MAKE) -C apps/personal-page build

deploy:
	$(MAKE) -C apps/personal-page deploy

invalidate:
	$(MAKE) -C apps/personal-page invalidate
