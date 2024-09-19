# Makefile

MONOREPO_ROOT := ../
export MONOREPO_REVISION := release
export BRANCH_NAME ?= v0.0.1
export OVERLEAF_BASE_BRANCH ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex-base:$(BRANCH_NAME)
export OVERLEAF_BASE_LATEST ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex-base
export OVERLEAF_BASE_TAG ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex-base:$(BRANCH_NAME)-$(MONOREPO_REVISION)
export OVERLEAF_BRANCH ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex:$(BRANCH_NAME)
export OVERLEAF_LATEST ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex
export OVERLEAF_TAG ?= registry.cn-beijing.aliyuncs.com/wltsz/sharelatex:$(BRANCH_NAME)-$(MONOREPO_REVISION)

all: build-base build-community

build-base:
	cp .dockerignore $(MONOREPO_ROOT)
	docker build \
	  --build-arg BUILDKIT_INLINE_CACHE=1 \
	  --file Dockerfile-base \
	  --tag $(OVERLEAF_BASE_TAG) \
	  --tag $(OVERLEAF_BASE_BRANCH) \
	  $(MONOREPO_ROOT)


# build-base:
# 	cp .dockerignore $(MONOREPO_ROOT)
# 	docker build \
# 	  --build-arg BUILDKIT_INLINE_CACHE=1 \
# 	  --file Dockerfile-base \
# 	  --pull \
# 	  --cache-from $(OVERLEAF_BASE_LATEST) \
# 	  --cache-from $(OVERLEAF_BASE_BRANCH) \
# 	  --tag $(OVERLEAF_BASE_TAG) \
# 	  --tag $(OVERLEAF_BASE_BRANCH) \
# 	  $(MONOREPO_ROOT)

build-community:
	cp .dockerignore $(MONOREPO_ROOT)
	docker build \
	  --build-arg BUILDKIT_INLINE_CACHE=1 \
	  --build-arg OVERLEAF_BASE_TAG \
	  --build-arg MONOREPO_REVISION \
	  --file Dockerfile \
	  --tag $(OVERLEAF_TAG) \
	  --tag $(OVERLEAF_BRANCH) \
	  $(MONOREPO_ROOT)

# build-community:
# 	cp .dockerignore $(MONOREPO_ROOT)
# 	docker build \
# 	  --build-arg BUILDKIT_INLINE_CACHE=1 \
# 	  --build-arg OVERLEAF_BASE_TAG \
# 	  --build-arg MONOREPO_REVISION \
# 	  --cache-from $(OVERLEAF_LATEST) \
# 	  --cache-from $(OVERLEAF_BRANCH) \
# 	  --file Dockerfile \
# 	  --tag $(OVERLEAF_TAG) \
# 	  --tag $(OVERLEAF_BRANCH) \
# 	  $(MONOREPO_ROOT)


.PHONY: all build-base build-community
