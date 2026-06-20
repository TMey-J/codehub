module EventHorizon
  class Payload
    def initialize(data)
      @data = data.transform_keys(&:to_sym)
    end

    def respond_to_missing?(name, include_private = false)
      @data.key?(name) || super
    end

    def method_missing(name, *args, &block)
      if @data.key?(name)
        @data[name]
      else
        super
      end
    end

    def to_h
      @data.dup
    end
  end
end
