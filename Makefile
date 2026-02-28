.PHONY: build deploy invalidate all

all: build deploy invalidate

build:
	npm run build

deploy:
	aws s3 sync dist/ s3://kopius-jt --delete

invalidate:
	aws cloudfront create-invalidation --distribution-id E1631T979B1SEX --paths "/*" --query "Invalidation.Status" --output text


