#!/bin/bash
set -e

drizzle-kit migrate
node server/index.mjs
