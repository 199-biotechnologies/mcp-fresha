#!/bin/bash

# Test the new tool names
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js 2>/dev/null | jq '.result.tools[] | {name, description}'