module EventHorizon
  class Runner
    def initialize
      @watchers = []
      @threads = []
      @stop = false
      @queue = Queue.new
    end

    def load_rules!
      Dir[File.join(RULES_DIR, "*.rb")].each do |file|
        instance_eval(File.read(file), file)
      end
    end

    def watch(type, source, **options, &block)
      require_relative "../watchers/#{type}_watcher"
      klass = const_get("#{type.to_s.capitalize}Watcher")
      watcher = klass.new(name: source, config: options, &block)
      @watchers << watcher
    end

    def start
      trap("INT") { stop }
      load_rules!
      LOGGER.info "Loaded #{@watchers.size} watchers"

      @watchers.each do |watcher|
        @threads << Thread.new do
          until @stop
            begin
              watcher.poll
              watcher.update_last_poll
            rescue => e
              LOGGER.error "#{watcher.name}: #{e.message}"
            end
            sleep watcher.poll_interval
          end
        end
      end

      @threads.each(&:join)
    end

    def stop
      @stop = true
      LOGGER.info "Shutting down..."
    end
  end
end
