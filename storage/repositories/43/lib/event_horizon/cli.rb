module EventHorizon
  class CLI
    def self.start(args)
      command = args.first
      case command
      when "start"
        Runner.new.start
      when "list"
        Dir[File.join(RULES_DIR, "*.rb")].each { |f| puts File.basename(f) }
      else
        puts "Usage: event_horizon {start|list}"
      end
    end
  end
end
