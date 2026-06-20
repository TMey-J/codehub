local M = {}

M.sensors = {
  motion = "detected",
  it = "dark"
}

function M.turn_on(target)
  print("[ACTION] Turning on " .. target)
end

function M.turn_off(target)
  print("[ACTION] Turning off " .. target)
end

function M.notify(target)
  print("[NOTIFY] Sending notification to " .. target)
end

function M.get_hour()
  return tonumber(os.date("%H"))
end

return M
