module EventHorizon
  class Notifier
    def self.notify(type, **params)
      klass_name = "#{type.to_s.capitalize}Notifier"
      require_relative "../notifiers/#{type}_notifier"
      klass = const_get(klass_name)
      klass.new(params).deliver
    rescue LoadError, NameError
      raise "Unknown notifier: #{type}"
    end

    def initialize(params)
      @params = params
    end

    def deliver
      raise NotImplementedError
    end
  end
end
