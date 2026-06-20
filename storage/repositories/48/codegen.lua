local M = {}

function M.generate(ast)
  local lines = {}
  local function cond_to_lua(c)
    if c.type == "and" then
      return "(" .. cond_to_lua(c.left) .. " and " .. cond_to_lua(c.right) .. ")"
    elseif c.type == "or" then
      return "(" .. cond_to_lua(c.left) .. " or " .. cond_to_lua(c.right) .. ")"
    elseif c.type == "sensor" then
      return 'runtime.sensors["' .. c.sensor .. '"] == "' .. c.state .. '"'
    elseif c.type == "time" then
      return "runtime.get_hour() == " .. c.hour
    else
      error("Unknown condition type")
    end
  end

  if ast.type == "action" then
    if ast.condition then
      table.insert(lines, "if " .. cond_to_lua(ast.condition) .. " then")
      table.insert(lines, '  runtime.' .. ast.action .. '("' .. ast.target .. '")')
      table.insert(lines, "end")
    else
      table.insert(lines, 'runtime.' .. ast.action .. '("' .. ast.target .. '")')
    end
  elseif ast.type == "notify" then
    if ast.condition then
      table.insert(lines, "if " .. cond_to_lua(ast.condition) .. " then")
      table.insert(lines, '  runtime.notify("' .. ast.target .. '")')
      table.insert(lines, "end")
    else
      table.insert(lines, 'runtime.notify("' .. ast.target .. '")')
    end
  end
  return table.concat(lines, "\n")
end

return M
