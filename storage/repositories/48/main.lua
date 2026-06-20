local lexer = require("lexer")
local Parser = require("parser")
local codegen = require("codegen")
local runtime = require("runtime")

local filename = arg[1]
if not filename then
  io.stderr:write("Usage: lua main.lua <rulefile>\n")
  os.exit(1)
end

local file = io.open(filename, "r")
if not file then
  io.stderr:write("Cannot open file: " .. filename .. "\n")
  os.exit(1)
end
local input = file:read("*all")
file:close()

local tokens = lexer.tokenize(input)
local pos = 1
local code_parts = {}
while pos <= #tokens do
  local parser = Parser.new(tokens, pos)
  local ast, new_pos = parser:parse()
  if not ast then break end
  pos = new_pos
  table.insert(code_parts, codegen.generate(ast))
end

local lua_code = table.concat(code_parts, "\n")
if lua_code == "" then
  io.stderr:write("No rules found in file.\n")
  os.exit(1)
end

local func, err = loadstring(lua_code)
if not func then
  io.stderr:write("Code generation error: " .. err .. "\n")
  os.exit(1)
end

_G.runtime = runtime
func()
