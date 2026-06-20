module EventHorizon
  class Rule
    def initialize(block)
      @block = block
    end

    def evaluate(payload)
      dsl = RuleDSL.new(payload)
      dsl.instance_eval(&@block)
    rescue => e
      LOGGER.error "Rule failed: #{e.message}"
    end
  end
end
