module EventHorizon
  class Watcher
    attr_reader :name, :config

    def initialize(name:, config: {}, &block)
      @name = name
      @config = config
      @rule_block = block
    end

    def fetch
      raise NotImplementedError
    end

    def poll
      data = fetch
      return unless data
      payload = Payload.new(data)
      Rule.new(@rule_block).evaluate(payload)
    end

    def poll_interval
      @config[:every] || 60
    end

    def last_poll
      @last_poll ||= read_state
    end

    def update_last_poll
      @last_poll = Time.now
      write_state
    end

    private

    def state_key
      "#{self.class.name}::#{name}"
    end

    def read_state
      return nil unless File.exist?(STATE_FILE)
      data = YAML.load_file(STATE_FILE) || {}
      data[state_key]
    end

    def write_state
      data = File.exist?(STATE_FILE) ? YAML.load_file(STATE_FILE) : {}
      data[state_key] = @last_poll
      File.write(STATE_FILE, data.to_yaml)
    end
  end
end
