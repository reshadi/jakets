ifndef JAKETS__INCLUDE_BARRIER_
JAKETS__INCLUDE_BARRIER_ = 1

# The following code will be use in almost all of the project makefiles
# before we include any new makefile, the current makefile will be the last
# item in the MAKEFILE_LIST variable. However, the $(dir ) function always
# adds / at the end of the result.
# to make the usage of this variable mroe readable and elegant, we add
# and extra / at the end to differentiate it from / in the middle of the path
# thre relpace // with nothing.
JAKETS__DIR := $(subst //,,$(dir $(lastword $(MAKEFILE_LIST)))/)

NODE__VERSION=v4.1.1 

###################################################################################################
# setup platform dependent variables
#
SHELL := /bin/bash
UNAME := $(shell uname)

ifeq ($(UNAME), Linux)
	NULL = /dev/null
else
	NULL = Out-Null
endif
#
###################################################################################################


NODE := node
NPM := npm

NODE_MODULES__DIR=$(JAKETS__DIR)/node_modules

TSD = $(NODE_MODULES__DIR)/.bin/tsd
TSC = $(NODE_MODULES__DIR)/.bin/tsc
JAKE = $(NODE_MODULES__DIR)/.bin/jake

#One can use the following local file to overwrite the above settings
-include LocalPaths.mk

###################################################################################################
# setup and rules in the current working directory
#

default: run

run: compile
	$(JAKE)

j-%: compile
	$(JAKE) $*

#The following it auto generated to make sure local Jakefile.ts dependencies are captured properly
-include Jakefile.mk

compile: setup
	if [ -f Jakefile.ts ]; then $(TSC) --module commonjs --sourceMap Jakefile.ts; fi
	if [ "`$(JAKE) -T | grep CreateDependencies`" == "" ]; \
		then $(JAKE) CreateDependencies -f $(JAKETS__DIR)/Jakefile.js; \
		else $(JAKE) CreateDependencies; \
	fi

# compile: setup Jakefile.js

# Jakefile.js:
# 	if [ -f Jakefile.ts ]; then $(TSC) --module commonjs --sourceMap Jakefile.ts; fi

# #We use the filter function to allow other makefiles to add more .ts files if they need to
# Jakefile.js: Jakefile.ts
# 	$(TSC) --module commonjs --sourceMap Jakefile.ts
# 	for f in $(filter %.ts, $^); do echo $$f && $(TSC) --module commonjs --sourceMap $$f; done
# 	$(JAKE) CreateDependencies

#
###################################################################################################


###################################################################################################
# setup in jakets directory
#

setup: $(TSC) $(JAKE) $(JAKETS__DIR)/Jakefile.js 

$(JAKETS__DIR)/Jakefile.js: $(JAKETS__DIR)/Jakefile.ts $(JAKETS__DIR)/typings/tsd.d.ts
	$(TSC) --module commonjs --sourceMap $^

#In the following we have to run tsd in the $(JAKETS__DIR), so we use the actual tsd path instead of $(TSD)
#$(JAKETS__DIR)/typings/jake/jake.d.ts: $(TSD)
$(JAKETS__DIR)/typings/tsd.d.ts: $(TSD) $(JAKETS__DIR)/package.json
	cd $(JAKETS__DIR) && \
	./node_modules/.bin/tsd install jake bower
	touch $@

NODE_MODULES_UPDATED__FILE_ := $(JAKETS__DIR)/node_modules/.node_modules_updated
$(TSC) $(TSD) $(JAKE): $(NODE_MODULES_UPDATED__FILE_)

$(NODE_MODULES_UPDATED__FILE_): $(JAKETS__DIR)/package.json
	mkdir -p $(@D) && \
	touch $@
	cd $(JAKETS__DIR) && \
	$(NPM) install

$(JAKETS__DIR)/package.json:
	cd $(JAKETS__DIR) && \
	$(NPM) init && \
	$(NPM) install typescript tsd jake bower --save

#
###################################################################################################



###################################################################################################
# Rules for debugging/validation
#

# Each makefile that wants to show the variables of the makefile can do the following
# Create a phony target that depends on the print-% where % is replaced by the name of variables
# Example:
.PHONY: show_vars
show_vars: $(patsubst %,print-%, \
          JAKETS__DIR \
          NODE \
          NPM \
          TSC \
          TSD \
          JOKE \
          )
	@echo ----------------------------------------------------------------^^^jakets^^^

print-%:
	$(info ----------------------------------------------------------------)
	$(info  $* = $($*))
#
###################################################################################################
endif
