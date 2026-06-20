local Parser = {}
Parser.__index = Parser

function Parser.new(tokens, start)
  local self = setmetatable({}, Parser)
  self.tokens = tokens
  self.pos = start or 1
  return self
end

function Parser:peek()
  return self.tokens[self.pos]
end

function Parser:consume()
  local tok = self.tokens[self.pos]
  self.pos = self.pos + 1
  return tok
end

function Parser:expect(val)
  local tok = self:consume()
  if tok ~= val then error("Expected '" .. val .. "' got '" .. tok .. "'") end
  return tok
end

function Parser:parse()
  local tok = self:peek()
  if not tok then return nil, self.pos end
  local ast
  if tok == "turn" then
    ast = self:parse_action()
  elseif tok == "notify" then
    ast = self:parse_notify()
  else
    error("Unknown action: " .. tok)
  end
  return ast, self.pos
end

function Parser:parse_action()
  self:expect("turn")
  local state = self:consume()
  if state ~= "on" and state ~= "off" then
    error("Expected 'on' or 'off' after 'turn'")
  end
  local target = {}
  while self:peek() and self:peek() ~= "when" and self:peek() ~= "if" do
    table.insert(target, self:consume())
  end
  local condition = nil
  if self:peek() == "when" or self:peek() == "if" then
    self:consume()
    condition = self:parse_condition()
  end
  return { type = "action", action = "turn_" .. state, target = table.concat(target, " "), condition = condition }
end

function Parser:parse_notify()
  self:expect("notify")
  local target = {}
  while self:peek() and self:peek() ~= "if" do
    table.insert(target, self:consume())
  end
  local condition = nil
  if self:peek() == "if" then
    self:consume()
    condition = self:parse_condition()
  end
  return { type = "notify", target = table.concat(target, " "), condition = condition }
end

function Parser:parse_condition()
  return self:parse_or()
end

function Parser:parse_or()
  local left = self:parse_and()
  while self:peek() == "or" do
    self:consume()
    left = { type = "or", left = left, right = self:parse_and() }
  end
  return left
end

function Parser:parse_and()
  local left = self:parse_primary()
  while self:peek() == "and" do
    self:consume()
    left = { type = "and", left = left, right = self:parse_primary() }
  end
  return left
end

function Parser:parse_primary()
  local tok = self:peek()
  if tok == "after" then
    self:consume()
    return self:parse_time()
  elseif tok == "(" then
    self:consume()
    local cond = self:parse_condition()
    self:expect(")")
    return cond
  else
    local sensor_parts = {}
    while self:peek() and self:peek() ~= "is" do
      table.insert(sensor_parts, self:consume())
    end
    if not self:peek() then error("Expected 'is' in sensor condition") end
    self:expect("is")
    local state_parts = {}
    while self:peek() and self:peek() ~= "and" and self:peek() ~= "or" and self:peek() ~= ")" do
      table.insert(state_parts, self:consume())
    end
    return { type = "sensor", sensor = table.concat(sensor_parts, " "), state = table.concat(state_parts, " ") }
  end
end

function Parser:parse_time()
  local num = self:consume()
  local ampm = self:consume()
  if not ampm or (ampm ~= "am" and ampm ~= "pm") then
    error("Expected am/pm after time")
  end
  local hour = tonumber(num)
  if not hour then error("Invalid time number") end
  if ampm == "pm" and hour < 12 then hour = hour + 12 end
  if ampm == "am" and hour == 12 then hour = 0 end
  return { type = "time", hour = hour }
end

return Parser

