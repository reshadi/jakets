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

EXPECTED_NODE_VERSION=v5.8.0

###################################################################################################
# setup platform dependent variables
#
SHELL := /bin/bash
UNAME := $(shell uname)
PLATFORM := linux-x64

ifeq ($(UNAME), Linux)
	NULL = /dev/null
else ifeq ($(UNAME), Darwin)
	NULL = /dev/null
	PLATFORM = darwin-x64
else 
# ifeq($(UNAME), MINGW32_NT-6.2)
	NULL = Out-Null
endif
#
###################################################################################################


NODE := node
NPM := npm

NODE_MODULES__DIR=$(JAKETS__DIR)/node_modules

NODE__DIR =
NODE__BIN = 
NODE_VERSION = $(shell $(NODE) --version 2>$(NULL))
ifneq "$(NODE_VERSION)" "$(EXPECTED_NODE_VERSION)"
  NODE_VERSION = $(EXPECTED_NODE_VERSION)
  NODE__DIR = $(NODE_MODULES__DIR)/nodejs
  # NODE__DIR = $(NODE_MODULES__DIR)/node-$(NODE_VERSION)
  NODE__BIN_DIR = $(NODE__DIR)/bin
  NODE__BIN = $(NODE__BIN_DIR)/$(NODE)
  NODE__DIST_NAME = node-$(NODE_VERSION)-$(PLATFORM).tar.gz
  export PATH := $(PWD)/$(NODE__BIN_DIR):$(PATH) 
endif

JAKE = $(NODE_MODULES__DIR)/.bin/jake

#One can use the following local file to overwrite the above settings
-include LocalPaths.mk

###################################################################################################
# setup and rules in the current working directory
#

# default: run_jake

jts_run_jake: jts_compile_jake
	$(JAKE)

j-%: jts_compile_jake
	$(JAKE) $*

#The following is auto generated to make sure local Jakefile.ts dependencies are captured properly
-include Jakefile.mk

$(JAKE_TASKS):%: j-%

jts_compile_jake: jts_setup

#
###################################################################################################


###################################################################################################
# setup in jakets directory
#

jts_setup: $(JAKE)
	$(JAKE) --jakefile $(JAKETS__DIR)/Jakefile.js jts:setup
	$(JAKE) jts:generate_dependencies


$(JAKE): $(NODE__BIN)
	cd $(JAKETS__DIR) && \
	$(NPM) install jake shelljs && \
	touch $@

_jts_get_node: $(NODE__BIN)

$(NODE__BIN): $(NODE__DIR)/$(NODE__DIST_NAME)
	cd $(NODE__DIR) && \
	tar xvf * --strip-components=1
	touch $@

$(NODE__DIR)/$(NODE__DIST_NAME): $(JAKETS__DIR)/Makefile
	rm -rf $(NODE__DIR)
	mkdir -p $(NODE__DIR)
	wget --directory-prefix=$(NODE__DIR) https://nodejs.org/dist/$(NODE_VERSION)/$(NODE__DIST_NAME)
	touch $@

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
          NODE__DIR \
          NODE__BIN \
          NODE_VERSION \
          NODE__DIST_NAME \
          NODE \
          NPM \
          TSC \
          TSD \
          JAKE \
          BOWER \
          PATH \
          )
	@echo ----------------------------------------------------------------^^^jakets^^^

print-%:
	$(info ----------------------------------------------------------------)
	$(info  $* = $($*))
#
###################################################################################################
endif
