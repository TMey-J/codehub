require "yaml"
require "json"
require "logger"
require "net/http"
require "net/smtp"
require "uri"
require "rss"
require "time"

module EventHorizon
  LOGGER = Logger.new(STDOUT)
  LOGGER.level = Logger::INFO
  ROOT = File.expand_path("../..", __FILE__)
  RULES_DIR = File.join(ENV["HOME"], "event_horizon/rules")
  STATE_FILE = File.join(ENV["HOME"], "event_horizon/state/timestamps.yml")
end

require_relative "event_horizon/core/payload"
require_relative "event_horizon/core/notifier"
require_relative "event_horizon/core/watcher"
require_relative "event_horizon/core/rule"
require_relative "event_horizon/dsl/rule_dsl"
require_relative "event_horizon/core/runner"
require_relative "event_horizon/cli"
