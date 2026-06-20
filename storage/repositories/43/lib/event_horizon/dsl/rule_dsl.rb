module EventHorizon
  class RuleDSL
    def initialize(payload)
      @payload = payload
    end

    def notify(type, **params)
      Notifier.notify(type, **params)
    end

    def respond_to_missing?(name, include_private = false)
      @payload.respond_to?(name) || super
    end

    def method_missing(name, *args, &block)
      if @payload.respond_to?(name)
        @payload.public_send(name, *args, &block)
      else
        super
      end
    end
  end
end
