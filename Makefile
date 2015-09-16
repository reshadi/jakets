ifndef THIRD_PARTY__INCLUDE_BARRIER_
THIRD_PARTY__INCLUDE_BARRIER_ = 1

# The following code will be use in almost all of the project makefiles
# before we include any new makefile, the current makefile will be the last
# item in the MAKEFILE_LIST variable. However, the $(dir ) function always
# adds / at the end of the result.
# to make the usage of this variable mroe readable and elegant, we add
# and extra / at the end to differentiate it from / in the middle of the path
# thre relpace // with nothing.
THIRD_PARTY__DIR := $(subst //,,$(dir $(lastword $(MAKEFILE_LIST)))/)


ROOT__DIR = .
NODE = node
NPM = npm
NODE_MODULES__DIR=$(THIRD_PARTY__DIR)/node_modules

TSD = $(NODE_MODULES__DIR)/.bin/tsd
TSC = $(NODE_MODULES__DIR)/.bin/tsc
JAKE = $(NODE_MODULES__DIR)/.bin/jake

default: run

run: compile
	$(JAKE)

j-%: compile
	$(JAKE) $*

-include Jakefile.mk

compile: setup Jakefile.js

#We use the filter function to allow other makes files to add more .ts files if they need to
Jakefile.js: Jakefile.ts
	$(TSC) --module commonjs --sourceMap Jakefile.ts
	for f in $(filter %.ts, $^); do echo $$f && $(TSC) --module commonjs --sourceMap $$f; done
	$(JAKE) CreateDependencies


setup: $(TSC) $(JAKE) $(THIRD_PARTY__DIR)/typings/jake/jake.d.ts

$(THIRD_PARTY__DIR)/typings/jake/jake.d.ts: $(TSD)
	cd $(THIRD_PARTY__DIR) && \
	$(TSD) install jake && \
	touch $@

NODE_MODULES_UPDATED__FILE_ := $(THIRD_PARTY__DIR)/.npm_modules_updated
$(TSC) $(TSD) $(JAKE): $(NODE_MODULES_UPDATED__FILE_)

$(NODE_MODULES_UPDATED__FILE_): $(THIRD_PARTY__DIR)/package.json
	cd $(THIRD_PARTY__DIR) && \
	$(NPM) install typescript tsd jake && \
	mkdir -p $(@D) && \
	touch $@

$(THIRD_PARTY__DIR)/package.json:
	cd $(THIRD_PARTY__DIR) && \
	$(NPM) init && \
	$(NPM) install typescript tsd jake --save

endif
