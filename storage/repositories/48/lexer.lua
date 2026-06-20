local M = {}
function M.tokenize(input)
  input = input:gsub("%p", " ")
  local tokens = {}
  for word in string.gmatch(input, "%S+") do
    table.insert(tokens, word)
  end
  return tokens
end
return M
